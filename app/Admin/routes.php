<?php

use Illuminate\Routing\Router;

Admin::registerAuthRoutes();



Route::group([
    'prefix'        => config('admin.route.prefix'),
    'namespace'     => config('admin.route.namespace'),
    'middleware'    => config('admin.route.middleware'),
], function (Router $router) {

    $router->get('/', 'HomeController@index');

    $router->resource('demo/users', UserController::class);
    $router->resource('images', UploadImagesController::class);
    $router->resource('category', CategoryController::class);
    $router->resource('about', AboutController::class);

});
