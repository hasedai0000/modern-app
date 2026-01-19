<?php

namespace Tests\Unit;

use App\Domain\Like\Entities\LikeEntity;
use PHPUnit\Framework\TestCase;

class LikeEntityTest extends TestCase
{
  /**
   * LikeEntityのコンストラクタとゲッターのテスト
   *
   * @return void
   */
  public function test_constructor_and_getters()
  {
    $entity = new LikeEntity(
      id: 1,
      user_id: 10,
      post_id: 20,
      created_at: '2024-01-01 12:00:00'
    );

    $this->assertEquals(1, $entity->getId());
    $this->assertEquals(10, $entity->getUserId());
    $this->assertEquals(20, $entity->getPostId());
    $this->assertEquals('2024-01-01 12:00:00', $entity->getCreatedAt());
  }

  /**
   * LikeEntityのtoArrayメソッドのテスト
   *
   * @return void
   */
  public function test_to_array()
  {
    $entity = new LikeEntity(
      id: 1,
      user_id: 10,
      post_id: 20,
      created_at: '2024-01-01 12:00:00'
    );

    $array = $entity->toArray();

    $this->assertIsArray($array);
    $this->assertEquals(1, $array['id']);
    $this->assertEquals(10, $array['user_id']);
    $this->assertEquals(20, $array['post_id']);
    $this->assertEquals('2024-01-01 12:00:00', $array['created_at']);
  }

  /**
   * LikeEntityのtoArrayメソッドが正しいキーを含むことを確認
   *
   * @return void
   */
  public function test_to_array_contains_correct_keys()
  {
    $entity = new LikeEntity(
      id: 1,
      user_id: 10,
      post_id: 20,
      created_at: '2024-01-01 12:00:00'
    );

    $array = $entity->toArray();

    $expected_keys = ['id', 'user_id', 'post_id', 'created_at'];
    foreach ($expected_keys as $key) {
      $this->assertArrayHasKey($key, $array);
    }
  }
}
