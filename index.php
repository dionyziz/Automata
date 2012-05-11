<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Automata</title>
        <link href='css/style.css' rel='stylesheet' />
    </head>
    <body>
        <header>
            <h1>Automata editor</h1>
            <noscript>
                <h2>Hello time traveller!</h2>
                <p>It's lovely to see someone from 1998 on our web application! Thanks for visiting.</p>
                <p>Unfortunately, <em>automata</em> is a web application that requires Javascript to run properly.</p>
                <p>Please <a href='https://support.google.com/adsense/bin/answer.py?hl=en&amp;answer=12654'>Enable Javascript</a>
                and try again.</p>
            </noscript>
            <ol class='toolbar'>
                <li class='move selected'><a href=''><span></span>Move states</a></li>
                <li class='transition'><a href=''><span></span>Create transition</a></li>
                <li class='share'><a href=''><span></span>Share</a></li>
            </ol>
            <ol class='account'>
                <li><a href=''><img src='images/dio.jpg' class='avatar' width='27' height='27' /> dionyziz</a></li>
                <li><a href=''>Sign out</a></li>
            </ol>
            <div class='eof'></div>
        </header>
        <div id='filemanager'>
        </div>
        <div id='editor'>
            <canvas width='800' height='800'></canvas>
        </div>
        <script src='js/debug.js'></script>
        <script src='js/object.js'></script>
        <script src='js/eventemitter.js'></script>
        <script src='js/math.js'></script>
        <script src='js/automaton.js'></script>
        <script src='js/automatonview.js'></script>
        <script src='js/render.js'></script>
        <script src='js/editor.js'></script>
        <script src='js/test.js'></script>
        <script src='js/jquery-1.7.2.min.js'></script>
        <script src='js/ui.js'></script>
    </body>
</html>
