<?php

namespace Tests\Unit;

use App\Domain\Post\Entities\PostEntity;
use PHPUnit\Framework\TestCase;

class PostEntityTest extends TestCase
{
    /**
     * PostEntityのコンストラクタとゲッターのテスト
     *
     * @return void
     */
    public function test_constructor_and_getters()
    {
        $entity = new PostEntity(
            id: 1,
            user_id: 10,
            user_name: 'testuser',
            content: 'テスト投稿内容',
            created_at: '2024-01-01 12:00:00',
            likes_count: 5,
            comments_count: 3
        );

        $this->assertEquals(1, $entity->getId());
        $this->assertEquals(10, $entity->getUserId());
        $this->assertEquals('testuser', $entity->getUserName());
        $this->assertEquals('テスト投稿内容', $entity->getContent());
        $this->assertEquals('2024-01-01 12:00:00', $entity->getCreatedAt());
        $this->assertEquals(5, $entity->getLikesCount());
        $this->assertEquals(3, $entity->getCommentsCount());
    }

    /**
     * PostEntityのtoArrayメソッドのテスト
     *
     * @return void
     */
    public function test_to_array()
    {
        $entity = new PostEntity(
            id: 1,
            user_id: 10,
            user_name: 'testuser',
            content: 'テスト投稿内容',
            created_at: '2024-01-01 12:00:00',
            likes_count: 5,
            comments_count: 3
        );

        $array = $entity->toArray();

        $this->assertIsArray($array);
        $this->assertEquals(1, $array['id']);
        $this->assertEquals('testuser', $array['user_name']);
        $this->assertEquals('テスト投稿内容', $array['content']);
        $this->assertEquals('2024-01-01 12:00:00', $array['created_at']);
        $this->assertEquals(5, $array['likes_count']);
        $this->assertEquals(3, $array['comments_count']);
        $this->assertArrayNotHasKey('user_id', $array); // user_idはtoArrayに含まれない
    }

    /**
     * PostEntityのtoArrayメソッドが正しいキーを含むことを確認
     *
     * @return void
     */
    public function test_to_array_contains_correct_keys()
    {
        $entity = new PostEntity(
            id: 1,
            user_id: 10,
            user_name: 'testuser',
            content: 'テスト投稿内容',
            created_at: '2024-01-01 12:00:00',
            likes_count: 0,
            comments_count: 0
        );

        $array = $entity->toArray();

        $expected_keys = ['id', 'user_name', 'content', 'created_at', 'likes_count', 'comments_count'];
        foreach ($expected_keys as $key) {
            $this->assertArrayHasKey($key, $array);
        }
    }
}

