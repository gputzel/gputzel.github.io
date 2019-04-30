---
layout: post
title: JavaScript implementation of Markov Chain Monte Carlo cryptogram decoder
---

I have been working on a JavaScript version of the Markov Chain Monte Carlo cryptogram decoder from [the last post]({% post_url 2015-09-10-MCMC-decode %}). The JavaScript version shows you the permutations that the program is trying, so that you can watch the Monte Carlo approach in action. You can also mess around with it in real time, changing the "temperature", randomizing the permutation, or changing the ciphertext. You can find the code on [GitHub](https://github.com/gputzel/jsDecode). 

As in the demo of the Python program from that post, this program has been "trained" on [War and Peace](http://www.gutenberg.org/cache/epub/2600/pg2600.txt). Click the Go button to begin!

Things you can try:

-   Change the "temperature," which determines the algorithm's tendency to accept trial moves even when they don't immediately lead to higher likelihood. If the temperature is chosen correctly, this can allow the program to escape local "traps." However, if the temperature is too high it will not settle down into a solution!
-   Make your own ciphertext by typing plaintext into the ciphertext box, and turning the temperature way up - the scrambled text in the output is your cryptogram. Or you can just let the program try to "solve" your plaintext cryptogram, in which case it should settle into something close to the identity permutation, with each letter mapped to itself.

Some questions to ponder:

-   How long does a message need to be before it can be decoded?
-   How does the message length affect the "melting temperature" below which the program solves the cryptogram?
-   To what extent is there a "melting temperature" at all? If it is well-defined, is it a first-order or a continuous [phase transition](https://en.wikipedia.org/wiki/Phase_transition)?
-   How does it affect the number of steps that it takes to find the solution?
-   Is there some coarse-grained way to understand the "likelihood landscape"? Are there, for example, barriers of low likelihood separating permutations with different cycle-structures?

It seems that there are many interesting questions and that the analogy with statistical physics should be pursued further!
