parallax
========

Javascript parallax, mimicking parallax in iOS.

Works on iPad and iPhone 5S.

I've decided to not use trigonometry, to help increase framerate performance.

Device orientation values are weighted to avoid movement corresponding with rotation along the axis orthogonal to the screen, as this doesn't happen in iOS.

### TODO

Add 'soft reset', a slow pull towards the center. (You'll notice this if you look for it on an iOS device.)

Possibly fix buggyness when device is held vertically.
