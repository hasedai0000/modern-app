<?php

namespace Tests\Unit;

use App\Domain\User\Entities\UserEntity;
use PHPUnit\Framework\TestCase;

class UserEntityTest extends TestCase
{
    /**
     * UserEntityのコンストラクタとゲッターのテスト
     *
     * @return void
     */
    public function test_constructor_and_getters()
    {
        $entity = new UserEntity(
            id: 1,
            firebase_uid: 'test-firebase-uid-123',
            user_name: 'testuser',
            email: 'test@example.com'
        );

        $this->assertEquals(1, $entity->getId());
        $this->assertEquals('test-firebase-uid-123', $entity->getFirebaseUid());
        $this->assertEquals('testuser', $entity->getUserName());
        $this->assertEquals('test@example.com', $entity->getEmail());
    }

    /**
     * UserEntityのfirebase_uidがnullの場合のテスト
     *
     * @return void
     */
    public function test_constructor_with_null_firebase_uid()
    {
        $entity = new UserEntity(
            id: 1,
            firebase_uid: null,
            user_name: 'testuser',
            email: 'test@example.com'
        );

        $this->assertNull($entity->getFirebaseUid());
    }

    /**
     * UserEntityのtoArrayメソッドのテスト
     *
     * @return void
     */
    public function test_to_array()
    {
        $entity = new UserEntity(
            id: 1,
            firebase_uid: 'test-firebase-uid-123',
            user_name: 'testuser',
            email: 'test@example.com'
        );

        $array = $entity->toArray();

        $this->assertIsArray($array);
        $this->assertEquals(1, $array['id']);
        $this->assertEquals('test-firebase-uid-123', $array['firebase_uid']);
        $this->assertEquals('testuser', $array['user_name']);
        $this->assertEquals('test@example.com', $array['email']);
    }

    /**
     * UserEntityのtoArrayメソッドがnullのfirebase_uidを正しく処理することを確認
     *
     * @return void
     */
    public function test_to_array_with_null_firebase_uid()
    {
        $entity = new UserEntity(
            id: 1,
            firebase_uid: null,
            user_name: 'testuser',
            email: 'test@example.com'
        );

        $array = $entity->toArray();

        $this->assertNull($array['firebase_uid']);
    }

    /**
     * UserEntityのtoArrayメソッドが正しいキーを含むことを確認
     *
     * @return void
     */
    public function test_to_array_contains_correct_keys()
    {
        $entity = new UserEntity(
            id: 1,
            firebase_uid: 'test-firebase-uid-123',
            user_name: 'testuser',
            email: 'test@example.com'
        );

        $array = $entity->toArray();

        $expected_keys = ['id', 'firebase_uid', 'user_name', 'email'];
        foreach ($expected_keys as $key) {
            $this->assertArrayHasKey($key, $array);
        }
    }
}

