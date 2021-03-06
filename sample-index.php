<?php
define('IN_PHPBB', true);
$phpbb_root_path = (defined('PHPBB_ROOT_PATH')) ? PHPBB_ROOT_PATH : './';
$phpEx = substr(strrchr(__FILE__, '.'), 1);
include($phpbb_root_path . 'common.' . $phpEx);

// Start session management
$user->session_begin();
$auth->acl($user->data);
$user->setup();
// Require login
if ($user->data['user_id'] == ANONYMOUS )
  {
    login_box('', $user->lang['LOGIN']);
  } 
page_header('<Title of the page>');
$url=append_sid('dragoon-forums/<forum-sample>.html');
$template->set_filenames(array(
			       'body' => $url,
			       ));
make_jumpbox(append_sid("{$phpbb_root_path}viewforum.$phpEx"));
page_footer();

?>
