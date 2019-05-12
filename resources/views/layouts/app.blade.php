<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="generator" content="CrookedAngle Photography">
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>CrookedAngle</title>

    <!-- Scripts -->
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css">

    <!-- Styles -->
    <link rel="stylesheet" href="{{asset('css/uikit.min.css')}}" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.3/js/uikit.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.3/js/uikit-icons.min.js"></script>
    <link rel="stylesheet" type="text/css" href="{{asset('css/normalize.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/base.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/style.css')}}">

    <!-- OTHER CSS STYLE -->
    <link rel="stylesheet" type="text/css" href="{{asset('css/royal_preloader.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/animsition.min.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/jquery.fullPage.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/jquery.fancybox.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/font-awesome.min.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/animate.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/mb-comingsoon.css')}}">
    <link rel="stylesheet" type="text/css" href="{{asset('css/fontastic.css')}}">

    <!-- FAVICON -->
    <link rel="shortcut icon" type="image/x-icon" href="{{asset('images/headerlogo.jpg')}}">
</head>
<body>
<div class="title-wrapper">

<!-- ROYAL PRELOADER -->

<div id="app">
<!-- TOP BORDER -->
<div class="top-border">
    <div class="w-row">
        <div class="w-col w-col-6 w-clearfix">
            <p href="index.php" style="font-size: 2em;" class="w-inline-block brand-logo animsition-link">CrookedAngle
            </p>
        </div>
        <div class="w-col w-col-6">
            <div class="social-wrapper">
                <a href="#" class="w-inline-block social-icon facebook">
                    <i class="fa fa-facebook"></i>
                </a>
                <a href="#" class="w-inline-block social-icon twitter">
                    <i class="fa fa-twitter"></i>
                </a>
                <a href="#" class="w-inline-block social-icon behance">
                    <i class="fa fa-instagram"></i>
                </a>

            </div>
        </div>
    </div>
</div>


    <!-- LEFT BORDER -->
    <div class="left-border">
        <div data-ix="show-overlay-menu-on-click" class="w-embed move-center-hamb">
            <button class="c-hamburger c-hamburger--htla">
                <span>toggle menu</span>
            </button>
        </div>
    </div>

    <!-- RIGHT BORDER -->
    <div class="right-border"></div>

    <!-- BOTTOM BORDER -->
    <div class="bottom-border">
        <div class="w-hidden-medium w-hidden-small w-hidden-tiny title-top-border">
            <div>CrookedAngle</div>
        </div>
    </div>
    <div data-ix="hide-overlay-menu-on-load" class="overlay-menu">
        <div class="w-container port-contatiner">
            <!-- NAVIGATION -->
            <nav>
                <ul class="w-list-unstyled ul-nav">
                    <li data-ix="close-dropdown-on-hover"><a href="index" data-ix="show-dropdown-on-hover" class="w-inline-block nav-link animsition-link"><h3 style="color: white" class="biger">Home</h3></a>
                    </li>
                    <li data-ix="close-dropdown-on-hover"><a href="about" data-ix="show-dropdown-on-hover" class="w-inline-block nav-link animsition-link"><h3 style="color: white" class="biger">about</h3></a>
                    </li>


                    <li data-ix="close-dropdown-on-hover"><a href="contact" data-ix="show-dropdown-on-hover" class="w-inline-block nav-link animsition-link"><h3 style="color: white" class="biger">contact</h3></a>
                    </li>
                </ul>
            </nav>
            <!-- END NAVIGATION -->
        </div>
    </div>

    <!-- RESPONSIVE NAVIGATION -->
    <div class="w-hidden-main">
        <div class="responsive-menu">
            <div class="w-container">
                <a href="index.php" class="w-inline-block brand-logo more-margin animsition-link"><img width="135" src="{{asset('images/headerlogo.jpg')}}" alt="logo">
                </a>
                <div data-ix="open-responsive-menu" class="hamburger">
                    <div class="w-embed">
                        <button class="c-hamburger c-hamburger--htx">
                            <span>toggle menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <nav class="responsive-nav">
            <div class="w-container">
                <ul class="w-list-unstyled dd-big-res">
                    <li>
                        <div class="w-clearfix nav-res-link"><a href="index.php" class="res-txt animsition-link">home</a>
                        </div>
                    </li>
                    <li>
                        <div class="w-clearfix nav-res-link"><a href="about" class="res-txt animsition-link">about</a>
                        </div>
                    </li>


                    <li>
                        <div class="w-clearfix nav-res-link"><a href="contact" class="res-txt animsition-link">Contact</a>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
    <!-- END RESPONSIVE NAVIGATION -->

    <main class="py-4">
        @yield('content')
    </main>
    <!-- FOOTER -->
    <footer class="footer">
        <div class="w-container">
            <div class="w-row">
                <div class="w-col w-col-4">
                    <div class="contact-wrapper">
                        <div class="data-blog cont-ico">
                            <i class="fa fa-phone" aria-hidden="true"></i>

                        </div>
                        <div class="cont-sub-txt">Phone</div>
                        <p>




                        </p>
                    </div>
                </div>
                <div class="w-col w-col-4">

                </div>
                <div class="w-col w-col-4">
                    <div class="contact-wrapper">
                        <div class="data-blog cont-ico">
                            <i class="fa fa-envelope" aria-hidden="true"></i>

                        </div>
                        <div class="cont-sub-txt">E-mail</div>
                        <p><a class="mail" href="mailto:">fabianvanniel@crookedangle.nl</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    <!-- END FOOTER -->




    </div>
<!-- SCROLL TO TOP -->
<a href="#0" class="cd-top">Top</a>

<!-- JQUERY SCRIPTS -->
<script>
    // Script to open and close sidebar
    function w3_open() {
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("myOverlay").style.display = "block";
    }

    function w3_close() {
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("myOverlay").style.display = "none";
    }

    // Modal Image Gallery
    function onClick(element) {
        document.getElementById("img01").src = element.src;
        document.getElementById("modal01").style.display = "block";
        var captionText = document.getElementById("caption");
        captionText.innerHTML = element.alt;
    }

</script>
<script type="text/javascript" src="{{asset('js/modernizr.js')}}"></script>
<script type="text/javascript" src="{{asset('js/jquery-1.11.3.min.js')}}"></script>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js"></script>
<script>
    WebFont.load({
        google: {
            families: ["Lekton:regular","Yellowtail:regular","Playfair Display:regular,italic,700"]
        }
    });
</script>
<script type="text/javascript" src="{{asset('js/isotope.pkgd.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/imagesloaded.pkgd.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/jquery.animsition.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/jquery.fullPage.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/royal_preloader.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/jquery.fancybox.pack.js')}}"></script>
<script type="text/javascript" src="{{asset('js/wow.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/tweecoolmi.js')}}"></script>
<script type="text/javascript" src="{{asset('js/jquery.mb-comingsoon.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/typed.js')}}"></script>
<script type="text/javascript" src="{{asset('js/plugins.js')}}"></script>
<!--[if lte IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/placeholders/3.0.2/placeholders.min.js"></script><![endif]-->

<!-- THEME CUSTOM -->
<script type="text/javascript" src="{{asset('js/scripts.js')}}"></script>
</body>
</html>
