-- Update notification system to use UrbanPulse branding
-- Creating new script to update email templates with UrbanPulse branding

-- Update the notification functions to use UrbanPulse branding
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
      
      -- Queue email notification with UrbanPulse branding
      INSERT INTO public.email_queue (to_email, subject, body_text, issue_id)
      VALUES (
        NEW.citizen_email,
        format('UrbanPulse Update: %s', notification_title),
        format('Hello,\n\nYour issue report "%s" has been updated.\n\n%s\n\nYou can track your report at: [tracking_url]\n\nThank you for helping improve our community!\n\nUrbanPulse Team', NEW.title, notification_message),
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

-- Update the new issue notification function
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
    
    -- Queue email confirmation with UrbanPulse branding
    INSERT INTO public.email_queue (to_email, subject, body_text, issue_id)
    VALUES (
      NEW.citizen_email,
      'UrbanPulse: Your Issue Has Been Received',
      format('Hello,\n\nThank you for reporting an issue in our community.\n\nIssue: %s\nLocation: %s\nAssigned to: %s\n\nWe will keep you updated on the progress. You can track your report at: [tracking_url]\n\nReport ID: %s\n\nThank you for helping make our community better!\n\nUrbanPulse Team', NEW.title, NEW.location_address, NEW.assigned_department, NEW.id),
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
