@extends('layouts.app')
@section('content')

    <section id="filter" class="w-section section-imp">
        <div class="w-container">

        </div>
            <div uk-filter="target: .js-filter">
                <div class="w-clearfix filter-cont">
                    <div data-ix="open-filter-menu" class="w-clearfix show-filter">
                        <div class="filter-button">
                            <div class="w-embed"><i class="fa fa-filter"></i>
                            </div>
                        </div>
                        <div class="w-clearfix filter-effect">
                            <div data-ix="hide-filter-opacity-0" class="filter-txt">Hide Filter</div>
                            <div class="filter-txt-hide">Show Filter</div>
                        </div>
                    </div>
                    <div data-ix="move-filter-content-on-load" class="w-clearfix filters button-group">
                        <ul class="uk-subnav uk-subnav-pill">

                            <li class="uk-active button" uk-filter-control><a href="#">All</a></li>
                                @foreach($category as $categories)
                                    <li class="button" uk-filter-control="[data-color='{{$categories->id}}']"><a href="#">{{$categories->name}}</a></li>
                                @endforeach
                        </ul>
                    </div>
                </div>


                <ul class="js-filter uk-child-width-1-5@m" uk-grid uk-lightbox="animation: fade">
                    @foreach($results as $photos)
                        @if($photos['category'] == '1' || '2' || '3')


                                    <a data-color="{{$photos->category}}" class="uk-inline" href="{{$photos->image}}" data-caption="Caption 1">
                                        <img class="uk-height-medium"  src="{{ asset($photos->image) }}" data-type="image"  uk-img />
                                    </a>


                        @endif
                    @endforeach
                </ul>
            </div>






    </section>
@endsection