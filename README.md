# dragoon-forums
Scripts and pages for Dragoon Forums

## Setup Instructions

The current plan is for index.php and config.php to be the .gitignore'd files in the repot.

You will need to copy example-index.php and example-config.php to index.php and config.php respectively, then edit them appropriately for your specific forum.  This includes telling your index.php to import a new index page (see next section).
## Installation Instructions
1. Create a new directory <forum_name> on the server inside /home/laits
2. Clone this repository inside <forum_name> directory.
3. Switch to install branch `git checkout install`
4. Create a symlink <forum_name> in the /home/laits/public_html directory to point to the newly created forum.
5. Create a MYSQL database. Usually with same name as <forum_name>
6. In your browswer, Navigate to http://dragoon.asu.edu/<forum_name>/install
7. Click on Install Tab
8. Enter the database details as follows:
  * Type: MYSQL
  * Host: 127.0.0.1
  * Database Name: <database_name>
  * Username: root
9. Fill in the Administrator Details as needed
10. Use default Email settings and other settings.
11. Once the Forum is sucessfully created and config.php is generated, Checkout the Master branch of the dragoon_forum `git checkout master`
12. Create a template file or copy from existing one <forum_template>.html inside <forum_name>/styles/prosilver/template/dragoon-forums/ directory
13. In the parent folder. Create a copy of sample-index.php and rename it to index.php
14. Edit index.php to point to correct template file <forum_template>.html
15. You can now navigate to http://dragoon.asu.edu/<forum_name> to use the forum.


##Index Page (or: How do I customize the home page for a specific class?)
Each forum should have its own custom index page.  The index will be created by index.php importing an html file from the styles/prosilver/template/dragoon-forums/.  Each forum will have its own html file, and all of them will be stored in that aforementioned directory.  forum_sample.html is intended to be both an example and also the html for the public forum (aka the sample class).
