<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase;
use Tests\CreatesApplication;

class UserModelTest extends TestCase
{
    use CreatesApplication;

    /**
     * Userモデルのfillable属性を確認
     *
     * @return void
     */
    public function test_fillable_attributes()
    {
        $user = new User();
        $fillable = $user->getFillable();

        $this->assertContains('firebase_uid', $fillable);
        $this->assertContains('user_name', $fillable);
        $this->assertContains('email', $fillable);
        $this->assertContains('password', $fillable);
    }

    /**
     * Userモデルのhidden属性を確認
     *
     * @return void
     */
    public function test_hidden_attributes()
    {
        $user = new User();
        $hidden = $user->getHidden();

        $this->assertContains('password', $hidden);
    }

    /**
     * postsリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_posts_relation()
    {
        $user = new User();
        $this->assertTrue(method_exists($user, 'posts'));
    }

    /**
     * likesリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_likes_relation()
    {
        $user = new User();
        $this->assertTrue(method_exists($user, 'likes'));
    }

    /**
     * commentsリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_comments_relation()
    {
        $user = new User();
        $this->assertTrue(method_exists($user, 'comments'));
    }
}

