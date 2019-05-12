<?php

namespace App\Http\Controllers;

use Laravelista\Picasso\Picasso;
use Illuminate\Support\Facades\Response;
use File;
use Image;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Photo;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    protected $photo;

    /**
     * [__construct description]
     * @param Photo $photo [description]
     */
    public function __construct(
        Photo $photo)
    {
        $this->photo = $photo;
    }

    /**
     * Display photo input and recent images
     * @return view [description]
     */
    public function index()
    {


        $photos = Photo::paginate(12);
        return view('upload', compact('photos'));
    }


    public function uploadImage(Request $request, Picasso $picasso)
    {
        $request->validate([
            'image' => 'required',
            'image.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        //check if image exist
        if ($request->hasFile('image')) {
            $images = $request->file('image');

            //check category
            $category = $request->get('category');

            //setting flag for condition
            $org_img = $thm_img = true;

            // create new directory for uploading image if doesn't exist
            if (!File::exists('storage/images/' . $category . '/')) {
                $org_img = File::makeDirectory('storage/images/' . $category . '/', 0777, true);
            }
            if (!File::exists('storage/images/thumbnails/')) {
                $thm_img = File::makeDirectory('storage/images/thumbnails', 0777, true);
            }

            // loop through each image to save and upload
            foreach ($images as $key => $image) {
                //create new instance of Photo class
                $newPhoto = new $this->photo;
                //get file name of image  and concatenate with 4 random integer for unique
                $filename = rand(1111, 9999) . time() . '.' . $image->getClientOriginalExtension();
                //path of image for upload
                $org_path = 'storage/images/' . $category . '/' . $filename;
                $thm_path = 'storage/images/thumbnails/' . $filename;

                $newPhoto->image = 'storage/images/' . $category . '/' . $filename;
                $newPhoto->category = $request->get('category');
                $newPhoto->thumbnail = 'storage/images/thumbnails/' . $filename;


                //don't upload file when unable to save name to database
                if (!$newPhoto->save()) {
                    return false;
                }

                // upload image to server
                if (($org_img && $thm_img) == true) {
                    Image::make($image)->fit(900, 500, function ($constraint) {
                        $constraint->upsize();
                    })->save($org_path);
                    Image::make($image)->fit(270, 160, function ($constraint) {
                        $constraint->upsize();
                    })->save($thm_path);
                }

            }
        }

        return redirect()->action('PhotoController@index');

    }

    public function destroy(Request $request,  $id)
    {
        $filename = $request->image;
        $uploaded_image = Photo::all()->first();

        if (empty($uploaded_image)) {
            return Response::json(['message' => 'Sorry file does not exist'], 400);
        }

        $file_path = $uploaded_image->image;
        print($file_path);

        if (file_exists($file_path)) {
            unlink($file_path);
        }

        if (!empty($uploaded_image)) {
            $uploaded_image->delete();
        }

        return redirect()->back()->with('succesful');
    }


}
