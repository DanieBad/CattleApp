# UI/UX Backlog

## 1. Landing Page & Pricing
- **Hero Section:** Replace "Start Your Free Trial" button text with "Join Beta Program". The button should still jump to the plan selection section below.
- **Pricing Section:** Replace all "Start Free Trial" buttons in the pricing cards with "Join Beta Program". 
- **Beta Logic:** Provide free access for the first 20 farmers joining the Beta testing program. Remove the time limit on software usage for Beta users, but retain the original free trial period logic in the codebase for future use when the app goes live.

## 2. Quick Start Guide
- **Dismissal Option:** Add a "Do not show again", "skip", or a combination of both to the Quick Start Guide, following web app best practices.

## 3. Help and Support Page
- **Layout:** Move the "Quick Start Guide" to the top of the page.
- **FAQ Updates:** 
  - Update the answer for "How do I add my first animal?". The current text says "Go to the 'Add Animal' page from the sidebar", but it should instruct the user to "Navigate to 'My Herd' and click on 'Add Animal' on the My Herd page".
  - **Styling:** The FAQ item is too small. Place it in a separate action block and format it similarly to the "Comprehensive Help Guide" block.
- **Contact Section:**
  - Remove the "Contact Support" button.
  - Change the "Send a Message" heading to "Contact Us".
  - Remove the "Direct Support" heading and replace it with "Email Contact".
  - Replace the descriptive text ("Typically we respond within 12-24 hours...") with "Please feel free to email us:". Keep the email address as is.
  - Remove the "Office Hours" block completely.

## 4. Billing & Subscription
- **Current Plan Label:** Under the "CURRENT PLAN" section, change the "Free Trial" badge/text to "Beta Program" while the app is in Beta.

## 5. Data Backup Export
- **CSV Content:** In the Download Data Backup export file for animals, remove database IDs (`id`, `sire_id`, `dam_id`). Replace them with the corresponding tag numbers (e.g., `tag_number`, `sire_tag_Number`, and `dam_Tag_number`).

## 6. Dashboard
- **View Journal:** Add an "All" option under "View Journal" to display all notes. 
- **Pagination:** Implement a pagination solution for the journal notes (max 20 notes displayed at a time) to prevent very long lists.

## 7. Welcome Email
- **Desktop Instructions:** In the section explaining how to add HealthyHerd to a mobile device, add instructions for adding it to a desktop on Mac and PC.
- **Broken Link Fix:** Fix the "Go to Dashboard" button in the Welcome email, which currently returns a 404 `DEPLOYMENT_NOT_FOUND` error. Update the link to point to the live site.
