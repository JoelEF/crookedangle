<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/



Route::get('/', 'PageController@index');
Route::get('/about', 'PageController@about');
Route::get('/contact', 'PageController@contact');
Route::post('/contact', 'PageController@postContact');


//Route::get('/', 'UploadImagesController@create');
//Route::post('/images-save', 'UploadImagesController@store');
//Route::post('/images-delete', 'UploadImagesController@destroy');
//Route::get('/images-show', 'UploadImagesController@index');
//
//Route::put('/images-edit/{id}/', [ 'uses' => 'UploadImagesController@update']);
//Route::get('/images-edit/{id}/edit', [ 'uses' => 'UploadImagesController@edit']);

//optimize

Route::middleware('optimizeImages')->group(function () {
//    // all images will be optimized automatically
Route::get('upload', 'PhotoController@index')->name('photo');
Route::post('upload', 'PhotoController@uploadImage');
Route::get('upload/delete/{id}','PhotoController@destroy');
});



Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');
