<?php

namespace Tests\Unit;

use App\Models\Post;
use Illuminate\Foundation\Testing\TestCase;
use Tests\CreatesApplication;

class PostModelTest extends TestCase
{
    use CreatesApplication;

    /**
     * Postモデルのfillable属性を確認
     *
     * @return void
     */
    public function test_fillable_attributes()
    {
        $post = new Post();
        $fillable = $post->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('content', $fillable);
    }

    /**
     * userリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_user_relation()
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'user'));
    }

    /**
     * likesリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_likes_relation()
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'likes'));
    }

    /**
     * commentsリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_comments_relation()
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'comments'));
    }

    /**
     * withCountsスコープが定義されていることを確認
     *
     * @return void
     */
    public function test_has_with_counts_scope()
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'scopeWithCounts'));
    }

    /**
     * getLikesCountAttributeアクセサが定義されていることを確認
     *
     * @return void
     */
    public function test_has_likes_count_accessor()
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'getLikesCountAttribute'));
    }

    /**
     * getCommentsCountAttributeアクセサが定義されていることを確認
     *
     * @return void
     */
    public function test_has_comments_count_accessor()
    {
        $post = new Post();
        $this->assertTrue(method_exists($post, 'getCommentsCountAttribute'));
    }
}

