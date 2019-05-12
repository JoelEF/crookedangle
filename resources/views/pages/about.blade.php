@extends('layouts.app')
@section('content')
    <div class="w-section section-imp">
        <div class="w-container">
            <div class="bottom-space">
                <div data-duration-in="300" data-duration-out="100" class="w-tabs tabs">
                    <div class="w-tab-menu tab-menu">
                        <a data-w-tab="Tab 1" class="w-tab-link w--current w-inline-block tab-link">
                            <div>Why CrookedAngle</div>
                        </a>
                        <a data-w-tab="Tab 2" class="w-tab-link w-inline-block tab-link">
                            <div>About Me</div>
                        </a>

                    </div>
                    <div class="w-tab-content">
                        <div data-w-tab="Tab 1" class="w-tab-pane w--tab-active">
                         @foreach($about as $abouts)
                            {{$abouts->why_crookedangle}}
                            @endforeach
                        </div>
                        <div data-w-tab="Tab 2" class="w-tab-pane">
                            @foreach($about as $abouts)
                                {{$abouts->about_me}}
                            @endforeach
                          </div>

                    </div>
                </div>
            </div>

            <div class="bottom-space">
                <div class="title-wrapper">
                    <h2>Fabian van Niel</h2>
                    <div><img src="images/sub-handmade.png">
                    </div>
                </div>
                <div class="w-clearfix">
                    <div class="item wow fadeInUp" data-wow-delay="0.2s">
                        <div data-ix="show-team-content" class="team-wrapper"><img src="">
                            <div class="team-overlay">
                                <div data-ix="move-up-team-contetn" class="team-content">
                                    <h4 class="team-name">Fabian van Niel</h4>
                                    <div class="portfolio-sub-title lighter">Photographer</div>
                                    <div class="social-team">
                                        <a href="#" class="w-inline-block social-icon social-white facebook">
                                            <i class="fa fa-facebook"></i>
                                        </a>
                                        <a href="#" class="w-inline-block social-icon twitter social-white">
                                            <i class="fa fa-twitter"></i>
                                        </a>
                                        <a href="#" class="w-inline-block social-icon instagram social-white">
                                            <i class="fa fa-behance"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="item wow fadeInUp" data-wow-delay="0.4s">
                        <div data-ix="show-team-content" class="team-wrapper"><img src="images/team-1.jpg">
                            <div class="team-overlay">
                                <div data-ix="move-up-team-contetn" class="team-content">
                                    <h4 class="team-name">Fabian van Niel</h4>
                                    <div class="portfolio-sub-title lighter">Photographer</div>
                                    <div class="social-team">
                                        <a href="#" class="w-inline-block social-icon social-white facebook">
                                            <i class="fa fa-facebook"></i>
                                        </a>
                                        <a href="#" class="w-inline-block social-icon twitter social-white">
                                            <i class="fa fa-twitter"></i>
                                        </a>
                                        <a href="#" class="w-inline-block social-icon instagram social-white">
                                            <i class="fa fa-behance"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>




        </div>
    </div>

@endsection