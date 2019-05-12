@extends('layouts.app')
@section('content')
    @if(Session::has('flashMessage'))
        <div class="alert alert-danger">
            {{ Session::get('flashMessage') }}
        </div>
    @endif


            <div class="cnt-content">
                <div class="title-wrapper">
                    <h2><rteselectionmarker></rteselectionmarker>contact us</h2>
                    <div><img src="images/sub-handmade.png">
                    </div>
                </div>
                <div>
                    <div>

                        <form class="uk-form-stacked" method="post" action="{{url('contact')}}">
                            {{csrf_field()}}
                            <div class="uk-margin">
                                <label  class="uk-form-label" for="subject">Subject: <input class="uk-input" type="text" name="subject" id="subject" maxlength="255" required></label>
                            </div>
                            <label  class="uk-form-label" for="name"><br/> <br/><br/><br/> Your name: <input class="uk-input" type="text" name="name" id="name" maxlength="255"></label>
                            <div class="uk-form-label">
                                <label for="email" class="uk-form-label">Email Address:</label>
                                <input id="email" type="email" placeholder="Enter your email address" name="email" data-name="Email" required  class="uk-input">
                            </div>
                            <label class="uk-form-label" for="message"><br/><br/><br/><br/>Your question:</label>
                            <textarea cols="30" rows="8" class="uk-textarea" name="message" id="message" placeholder="Your question" required></textarea><br>
                            <button class="uk-button uk-button-default uk-button-large" type="submit">Send message</button>
                        </form>

                        <div id="result"></div>
                    </div>
                </div>
            </div>


@endsection