<?php
/** @var $comment ?\App\Model\Comment */
?>

<div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="comment[name]" value="<?= $comment ? $comment->getName() : '' ?>">
</div>

<div class="form-group">
    <label for="content">Content</label>
    <textarea id="content" name="comment[content]"><?= $comment? $comment->getContent() : '' ?></textarea>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>