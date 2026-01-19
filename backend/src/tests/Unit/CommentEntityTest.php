<?php

namespace Tests\Unit;

use App\Domain\Comment\Entities\CommentEntity;
use PHPUnit\Framework\TestCase;

class CommentEntityTest extends TestCase
{
    /**
     * CommentEntityのコンストラクタとゲッターのテスト
     *
     * @return void
     */
    public function test_constructor_and_getters()
    {
        $entity = new CommentEntity(
            id: 1,
            user_id: 10,
            user_name: 'testuser',
            post_id: 20,
            content: 'テストコメント内容',
            created_at: '2024-01-01 12:00:00'
        );

        $this->assertEquals(1, $entity->getId());
        $this->assertEquals(10, $entity->getUserId());
        $this->assertEquals('testuser', $entity->getUserName());
        $this->assertEquals(20, $entity->getPostId());
        $this->assertEquals('テストコメント内容', $entity->getContent());
        $this->assertEquals('2024-01-01 12:00:00', $entity->getCreatedAt());
    }

    /**
     * CommentEntityのtoArrayメソッドのテスト
     *
     * @return void
     */
    public function test_to_array()
    {
        $entity = new CommentEntity(
            id: 1,
            user_id: 10,
            user_name: 'testuser',
            post_id: 20,
            content: 'テストコメント内容',
            created_at: '2024-01-01 12:00:00'
        );

        $array = $entity->toArray();

        $this->assertIsArray($array);
        $this->assertEquals(1, $array['id']);
        $this->assertEquals('testuser', $array['user_name']);
        $this->assertEquals('テストコメント内容', $array['content']);
        $this->assertEquals('2024-01-01 12:00:00', $array['created_at']);
        $this->assertArrayNotHasKey('user_id', $array); // user_idはtoArrayに含まれない
        $this->assertArrayNotHasKey('post_id', $array); // post_idはtoArrayに含まれない
    }

    /**
     * CommentEntityのtoArrayメソッドが正しいキーを含むことを確認
     *
     * @return void
     */
    public function test_to_array_contains_correct_keys()
    {
        $entity = new CommentEntity(
            id: 1,
            user_id: 10,
            user_name: 'testuser',
            post_id: 20,
            content: 'テストコメント内容',
            created_at: '2024-01-01 12:00:00'
        );

        $array = $entity->toArray();

        $expected_keys = ['id', 'user_name', 'content', 'created_at'];
        foreach ($expected_keys as $key) {
            $this->assertArrayHasKey($key, $array);
        }
    }
}

