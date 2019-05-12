<?php

namespace App\Http\Controllers;

use App\Category;
use App\Upload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\DB;
class UploadImagesController extends Controller
{

    private $photos_path;

    public function __construct()
    {
        $this->photos_path = public_path('/images');
    }

    /**
     * Display all of the images.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $photos = Upload::all();

        return view('uploaded-images', compact('photos', 'category'));
    }



    /**
     * Show the form for creating uploading new images.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $category = Category::all();
        return view('upload', compact('category'));
    }

    /**
     * Saving images uploaded through XHR Request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $photos = $request->file('file');

        if (!is_array($photos)) {
            $photos = [$photos];
        }

        if (!is_dir($this->photos_path)) {
            mkdir($this->photos_path, 0777);
        }

        for ($i = 0; $i < count($photos); $i++) {
            $photo = $photos[$i];
            $name = sha1(date('YmdHis') . str_random(30));
            $save_name = $name . '.' . $photo->getClientOriginalExtension();
            $resize_name = $name . str_random(2) . '.' . $photo->getClientOriginalExtension();

            $keep = basename($photo->getClientOriginalName());

            Image::make($photo)
                ->resize(250, null, function ($constraints) {
                    $constraints->aspectRatio();
                })
                ->save($this->photos_path . '/' . $resize_name);

            $category = $request->get('category');
            $destinationPath = public_path('uploads/'.$category.'');

            $photo->move( $destinationPath, $keep);

            $upload = new Upload();
            $upload->filename = basename($photo->getClientOriginalName());
            $upload->category_id = $request->get('category');
            $upload->resized_name = $resize_name;
            $upload->original_name = basename($photo->getClientOriginalName());
            $upload->save();
        }
        return response()->json(['success' => true, 'payload' => 'My message']);
    }

    public function edit($id)
    {
        $photos = DB::select('select * from uploads where id=?',[$id]);
        return view('edit', compact('photos'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $name = $request->get('filename');
        $resized_name = $request->get('resized_name');
        $original_name = $request->get('original_name');
        $photos = DB::update('update uploads set filename=?, resized_name=?, original_name=? where id=?',[$name, $resized_name, $original_name, $id]);
        if($photos){
            $red = redirect('/')->with('success','Data has been updated.');
        } else {
            $red = redirect('imagges-edit/'.$id.'/edit')->with('danger','Error update please try again.');
        }
        return $red;
    }

    /**
     * Remove the images from the storage.
     *
     * @param Request $request
     */
    public function destroy(Request $request)
    {
        $filename = $request->id;
        $uploaded_image = Upload::where('original_name', basename($filename))->first();

        if (empty($uploaded_image)) {
            return Response::json(['message' => 'Sorry file does not exist'], 400);
        }

        $file_path = $this->photos_path . '/' . $uploaded_image->filename;
        $resized_file = $this->photos_path . '/' . $uploaded_image->resized_name;

        if (file_exists($file_path)) {
            unlink($file_path);
        }

        if (file_exists($resized_file)) {
            unlink($resized_file);
        }

        if (!empty($uploaded_image)) {
            $uploaded_image->delete();
        }

        return Response::json(['message' => 'File successfully delete'], 200);
    }
}