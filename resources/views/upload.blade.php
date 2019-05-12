@extends('layouts.admin.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h4>Upload Multiple Images</h4>
                    </div>



                    <div class="panel-body">
                        @if (count($errors) > 0)
                            <div class="alert alert-danger">
                                Please correct following errors:
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        <form action="" method="post" enctype="multipart/form-data">
                            <div class="form-group">
                                <input type="file" name="image[]" class="form-control-file" multiple="true">

                                <br />
                                <input type="radio" name="category" class="form-control-file" value="1" checked>Landscape
                                <input type="radio" name="category" class="form-control-file" value="2">Wedding
                                <input type="radio" name="category" class="form-control-file" value="3">Street
                            </div>

                            {{ csrf_field() }}
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </form>

                        <hr>
                        <h3>Listing Images</h3>
                        {{ $photos->links() }}
                        <div uk-grid>
                            @forelse($photos as $photo)

                                <img src="{{ $photo->thumbnail }}"  class="img-responsive" uk-img >
                                <a href="{{ url('upload/delete/'.$photo->id)}}" class="btn btn warning">
                                    <button id="elimina" class="btn btn-danger" type="submit">Delete</button>
                                </a>
                            @empty
                                No image found
                            @endforelse
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection