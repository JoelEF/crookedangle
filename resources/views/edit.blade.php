
            @foreach($photos as $photo)
                <form action="{{ action('UploadImagesController@update', $photo->id) }}" method="post">
                    @csrf
                    @method('PUT')
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="filename" class="form-control" value="{{ $photo->filename }}">
                    </div>
                    <div class="form-group">
                        <label>Verkoopprijs</label>
                        <input type="text" name="resized_name" class="form-control" value="{{ $photo->resized_name }}">
                    </div>
                    <div class="form-group">
                        <label>Inkoopprijs</label>
                        <input type="text" name="original_name" class="form-control" value="{{ $photo->original_name }}">
                    </div>
                    <button type="submit" class="btn btn-dark">Opslaan</button>
                    <a href="{{ action('UploadImagesController@index') }}" class="btn btn-light">Terug</a>
                </form>
@endforeach