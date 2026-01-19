<?php

namespace Tests\Unit;

use App\Models\Comment;
use Illuminate\Foundation\Testing\TestCase;
use Tests\CreatesApplication;

class CommentModelTest extends TestCase
{
    use CreatesApplication;

    /**
     * Commentモデルのfillable属性を確認
     *
     * @return void
     */
    public function test_fillable_attributes()
    {
        $comment = new Comment();
        $fillable = $comment->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('post_id', $fillable);
        $this->assertContains('content', $fillable);
    }

    /**
     * userリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_user_relation()
    {
        $comment = new Comment();
        $this->assertTrue(method_exists($comment, 'user'));
    }

    /**
     * postリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_post_relation()
    {
        $comment = new Comment();
        $this->assertTrue(method_exists($comment, 'post'));
    }
}

