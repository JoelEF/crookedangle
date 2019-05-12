<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGimgsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('gimgs', function (Blueprint $table) {
            $table->increments('id');
            $table->string('file', 150);
            $table->string('title', 100);
            $table->string('descript', 250);
            $table->string('category', 250);
            $table->integer('dtreg');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('gimgs');
    }
}
