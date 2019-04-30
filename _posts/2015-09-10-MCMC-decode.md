---
layout: post
title: Using Markov Chain Monte Carlo to solve cryptograms
date: 2015-09-10
---

A while back I came across a fascinating article by the great [Persi Diaconis](https://en.wikipedia.org/wiki/Persi_Diaconis), called [The Markov Chain Monte Carlo Revolution](http://math.uchicago.edu/~shmuel/Network-course-readings/MCMCRev.pdf), wherein he describes several applications of MCMC. One of these was the use of Markov Chain Monte Carlo to solve cryptograms (simple substitution ciphers). I implemented this approach in a Python program, which is now [on GitHub](https://github.com/gputzel/decode).

Using the magic of [asciinema](https://asciinema.org) you can see my Python program in action below. The ciphertext is the famous cryptogram from Edgar Allan Poe's short story ["The Gold-Bug"](https://en.wikipedia.org/wiki/The_Gold-Bug). The program uses a training text to learn a "transition matrix", which tells how likely a given letter is to follow another in typical English text. Here I am using Tolstoy's "War and Peace" as the training text.

<script type="text/javascript" src="https://asciinema.org/a/YWG7r5NAG1QUYy4BpfYqIS83f.js" id="asciicast-YWG7r5NAG1QUYy4BpfYqIS83f" async></script>

Of course there are many improvements that could be made to this program. For example:

-   Currently the program reads command line arguments using the `optparse` library, which has been deprecated in favor of `argparse` since Python 2.7.
-   As it is, you have to know (or guess) whether the plaintext uses an alphabet with or without spaces. Of course, you could just run the program with both `alphabet.txt` or `alphabetWithSpace.txt` and see which one works. But it might be possible to improve the method so that it considers both of these possibilities and automatically detects which is more plausible.
