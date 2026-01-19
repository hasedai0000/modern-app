<?php

namespace Tests\Unit;

use App\Models\Like;
use Illuminate\Foundation\Testing\TestCase;
use Tests\CreatesApplication;

class LikeModelTest extends TestCase
{
    use CreatesApplication;

    /**
     * Likeモデルのfillable属性を確認
     *
     * @return void
     */
    public function test_fillable_attributes()
    {
        $like = new Like();
        $fillable = $like->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('post_id', $fillable);
    }

    /**
     * UPDATED_AT定数がnullであることを確認
     *
     * @return void
     */
    public function test_updated_at_is_null()
    {
        $this->assertNull(Like::UPDATED_AT);
    }

    /**
     * userリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_user_relation()
    {
        $like = new Like();
        $this->assertTrue(method_exists($like, 'user'));
    }

    /**
     * postリレーションが定義されていることを確認
     *
     * @return void
     */
    public function test_has_post_relation()
    {
        $like = new Like();
        $this->assertTrue(method_exists($like, 'post'));
    }
}

