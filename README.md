**Automata** is an editor for deterministic and non-deterministic finite automata
(DFA, NFA, NFAε). It is an open source web application aimed to help students
and educators better understand and explain the concepts of computation in
theoretical computer science university departments.

[Try it out](http://automata.discrete.gr/)

Learn more about automata:

 * [Wikipedia: Deterministic finite automaton](http://en.wikipedia.org/wiki/Deterministic_finite_automaton)
 * [Wikipedia: Non-deterministic finite automaton](http://en.wikipedia.org/wiki/Nondeterministic_finite_automaton)
 * Sipsers' book [Introduction to the Theory of Computation](http://www.amazon.com/Introduction-Theory-Computation-Michael-Sipser/dp/0534950973/ref=sr_1_2?s=books&ie=UTF8&qid=1339239779&sr=1-2)

Features
========

 * Real-time editing of automata
 * DFA, NFA, NFAε support
 * Step-by-step computation simulation
 * Sharing automata with a simple link
 * Fully native web application in vanilla Javascript

Technology
==========
Automata is written in HTML5 and Javascript for the client and Python for the server.


Deployment
==========
You will need apache with wsgi_mod and Python 2.7

First configure your application.

    $ cd (Automata_path)
    $ cp backend/config.example.py backend/config.py
    $ vim backend/config.py

Then run setup.py

    $ python backend/setup.py

Finally configure apache with wsgi.
You should put something like this to your host at `/etc/apache2/sites-enabled/(site)`

     <VirtualHost *:80>
         ServerName automata.discrete.gr
         DocumentRoot /var/www/discrete.gr/automata
         WSGIScriptAlias / /var/www/discrete.gr/automata/backend/server.wsgi
     </VirtualHost>

For development just ignore the last step and run `python server.py` inside the `/backend` folder.

Contributors
============

The Automata tool was developed at the [Computer Science](http://corelab.ntua.gr/) division of the
[Electrical and Computer Engineering](http://www.ece.ntua.gr/) department at the [National Technical
University of Athens](http://www.ntua.gr/), but is aimed at academic institutions wordwide.

Contributors:

 * Dionysis "dionyziz" Zindros <dionyziz@gmail.com>
 * Manolis Zampetakis <manoszambe@hotmail.com>
 * Kostis "gtklocker" Karantias <karantiaskostis@gmail.com>
 * Vasilis (Billy) Spilka <vasspilka@gmail.com>

We're looking to add several features. If you feel like contributing, just go ahead and do a pull request with your patch.

Some ideas for the future:

 * Login with Gmail to keep a list of your automata
 * Conversion from automaton to grammar and back
 * Conversion from automaton to regular expression and back
 * NFA to DFA conversion
 * Automaton minimization

Deployment
==========

You will need apache with wsgi_mod and Python 2.7

First configure your application.

    $ cd (Automata_path)
    $ cp backend/config.example.py backend/config.py
    $ vim backend/config.py

Then run setup.py

    $ python backend/setup.py

Finally configure apache with wsgi.
You should put something like this to your host at `/etc/apache2/sites-enabled/(site)`

     <VirtualHost *:80>
         ServerName automata.discrete.gr
         DocumentRoot /var/www/discrete.gr/automata
         WSGIScriptAlias / /var/www/discrete.gr/automata/backend/server.wsgi
     </VirtualHost>

For development ignore the last step and run `python backend/server.py` from root folder.

License
=======
The Automata editor is licensed under the MIT license:

Copyright (C) 2012 Dionysis Zindros

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
