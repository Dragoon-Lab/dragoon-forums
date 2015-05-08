# dragoon-forums
Scripts and pages for Dragoon Forums

## Setup Instructions

The current plan is for index.php and config.php to be the .gitignore'd files in the repot.

You will need to copy example-index.php and example-config.php to index.php and config.php respectively, then edit them appropriately for your specific forum.  This includes telling your index.php to import a new index page (see next section).

(TODO: add any installation instructions)

##Index Page (or: How do I customize the home page for a specific class?)
Each forum should have its own custom index page.  The index will be created by index.php importing an html file from the styles/prosilver/template/dragoon-forums/.  Each forum will have its own html file, and all of them will be stored in that aforementioned directory.  forum_sample.html is intended to be both an example and also the html for the public forum (aka the sample class).
