<?php

namespace App\Infrastructure\Repositories;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Models\User;

class EloquentUserRepository implements UserRepositoryInterface
{
  public function findByUid(string $uid): ?User
  {
    return User::query()->where('firebase_uid', $uid)->first();
  }

  public function save(string $uid, string $user_name, string $email): User
  {
    $user = new User();
    $user->firebase_uid = $uid;
    $user->user_name = $user_name;
    $user->email = $email;
    // Firebase認証なのでLaravel側passwordは使わない想定。DB制約のためダミーを入れる。
    $user->password = '';
    $user->save();

    return $user;
  }
}
