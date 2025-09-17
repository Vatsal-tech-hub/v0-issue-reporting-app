-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('citizen', 'admin')),
  recipient_email TEXT,
  recipient_id UUID, -- For admin notifications, references admin_users.id
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('issue_submitted', 'status_update', 'assignment', 'resolution', 'comment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_queue table for outbound email notifications
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  new_issues BOOLEAN DEFAULT true,
  status_changes BOOLEAN DEFAULT true,
  assignments BOOLEAN DEFAULT true,
  high_priority_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Admins can view their notifications" ON public.notifications
  FOR SELECT USING (
    recipient_type = 'admin' AND 
    recipient_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can update their notifications" ON public.notifications
  FOR UPDATE USING (
    recipient_type = 'admin' AND 
    recipient_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
  );

-- RLS Policies for email_queue (admin only)
CREATE POLICY "Admins can view email queue" ON public.email_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
  );

CREATE POLICY "Admins can manage email queue" ON public.email_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
  );

-- RLS Policies for notification preferences
CREATE POLICY "Admins can view their preferences" ON public.notification_preferences
  FOR SELECT USING (admin_user_id = auth.uid());

CREATE POLICY "Admins can manage their preferences" ON public.notification_preferences
  FOR ALL USING (admin_user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_type, recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_issue ON public.notifications(issue_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_admin ON public.notification_preferences(admin_user_id);

-- Create function to send notifications when issues are updated
CREATE OR REPLACE FUNCTION notify_issue_update()
RETURNS TRIGGER AS $$
DECLARE
  admin_user RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Determine notification content based on what changed
  IF OLD.status != NEW.status THEN
    notification_title := 'Issue Status Updated';
    notification_message := format('Issue "%s" status changed from %s to %s', NEW.title, OLD.status, NEW.status);
    
    -- Notify citizen if they provided email
    IF NEW.citizen_email IS NOT NULL THEN
      INSERT INTO public.notifications (
        recipient_type, recipient_email, issue_id, notification_type, title, message
      ) VALUES (
        'citizen', NEW.citizen_email, NEW.id, 'status_update', notification_title, notification_message
      );
      
      -- Queue email notification
      INSERT INTO public.email_queue (to_email, subject, body_text, issue_id)
      VALUES (
        NEW.citizen_email,
        format('CivicReport Update: %s', notification_title),
        format('Hello,\n\nYour issue report "%s" has been updated.\n\n%s\n\nYou can track your report at: [tracking_url]\n\nThank you for helping improve our community!\n\nCivicReport Team', NEW.title, notification_message),
        NEW.id
      );
    END IF;
  END IF;

  -- Notify assigned admin
  IF NEW.assigned_to IS NOT NULL THEN
    SELECT * INTO admin_user FROM public.admin_users WHERE id = NEW.assigned_to;
    
    IF admin_user.id IS NOT NULL THEN
      INSERT INTO public.notifications (
        recipient_type, recipient_id, recipient_email, issue_id, notification_type, title, message
      ) VALUES (
        'admin', admin_user.id, admin_user.email, NEW.id, 'assignment', 
        'Issue Assignment Update', 
        format('Issue "%s" has been updated', NEW.title)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to notify on new issues
CREATE OR REPLACE FUNCTION notify_new_issue()
RETURNS TRIGGER AS $$
DECLARE
  admin_user RECORD;
  dept_admins CURSOR FOR 
    SELECT au.* FROM public.admin_users au 
    JOIN public.departments d ON au.department_id = d.id 
    WHERE d.name = NEW.assigned_department AND au.is_active = true;
BEGIN
  -- Send confirmation to citizen
  IF NEW.citizen_email IS NOT NULL THEN
    INSERT INTO public.notifications (
      recipient_type, recipient_email, issue_id, notification_type, title, message
    ) VALUES (
      'citizen', NEW.citizen_email, NEW.id, 'issue_submitted',
      'Issue Report Received',
      format('Thank you for reporting "%s". We have received your report and assigned it to %s. You will receive updates as we work to resolve this issue.', NEW.title, NEW.assigned_department)
    );
    
    -- Queue email confirmation
    INSERT INTO public.email_queue (to_email, subject, body_text, issue_id)
    VALUES (
      NEW.citizen_email,
      'CivicReport: Your Issue Has Been Received',
      format('Hello,\n\nThank you for reporting an issue in our community.\n\nIssue: %s\nLocation: %s\nAssigned to: %s\n\nWe will keep you updated on the progress. You can track your report at: [tracking_url]\n\nReport ID: %s\n\nThank you for helping make our community better!\n\nCivicReport Team', NEW.title, NEW.location_address, NEW.assigned_department, NEW.id),
      NEW.id
    );
  END IF;

  -- Notify relevant department admins
  FOR admin_user IN dept_admins LOOP
    INSERT INTO public.notifications (
      recipient_type, recipient_id, recipient_email, issue_id, notification_type, title, message
    ) VALUES (
      'admin', admin_user.id, admin_user.email, NEW.id, 'issue_submitted',
      'New Issue Reported',
      format('A new %s priority %s issue has been reported: "%s" at %s', NEW.priority, NEW.category, NEW.title, NEW.location_address)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_issue_update ON public.issues;
CREATE TRIGGER trigger_notify_issue_update
  AFTER UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_issue_update();

DROP TRIGGER IF EXISTS trigger_notify_new_issue ON public.issues;
CREATE TRIGGER trigger_notify_new_issue
  AFTER INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_issue();

-- Insert default notification preferences for existing admin users
INSERT INTO public.notification_preferences (admin_user_id, email_notifications, new_issues, status_changes, assignments)
SELECT id, true, true, true, true
FROM public.admin_users
WHERE is_active = true
ON CONFLICT DO NOTHING;
