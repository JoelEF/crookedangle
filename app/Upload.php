<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Upload extends Model
{
    protected $table = 'uploads';
    public function category() {

        return $this->belongsTo('App\Category');

    }


}
