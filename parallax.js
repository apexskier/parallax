(function() {
    window.requestAnimationFrame = (function() {
        return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    window.parallax = {
        calibration: {
            x: 0,
            y: 0,
            z: 0,
            alpha: 0,
            beta: 0,
            gamma: 0
        },
        device: {
            x: null,
            y: null,
            z: null,
            alpha: null,
            beta: null,
            gamma: null
        },
        scale: {
            y: window.innerHeight * .50,
            x: window.innerWidth * .50
        },
        background: {
            x: null,
            y: null,
            offset: {
                x: null,
                y: null
            }
        },
        orientation: null,
        debug: true,
        distance: 5,
        transform: {},
        adjustCalibration: function() {
            window.parallax.calibration.alpha =
                ((window.parallax.calibration.alpha * 31) +
                 (window.parallax.device.alpha > 180 ? window.parallax.device.alpha - 360 : window.parallax.device.alpha)
                ) / 32;
            window.parallax.calibration.alpha =
                window.parallax.calibration.alpha > 180 ? window.parallax.calibration.alpha - 360 : window.parallax.calibration.alpha;
            window.parallax.calibration.beta = ((window.parallax.calibration.beta * 31) + window.parallax.device.beta) / 32;
            window.parallax.calibration.gamma = ((window.parallax.calibration.gamma * 31) + window.parallax.device.gamma) / 32;
        },
        render: function() {
            adjustCalibration();

            $('.parallax').each(function() {
                var dist = parseFloat($(this).data('parallax'));
                $(this).css({
                    '-webkit-transform':'translateX(' + ((window.parallax.transform.x() / 40) * dist) + 'px) ' +
                                        'translateY(' + ((window.parallax.transform.y() / 40) * dist) + 'px)'
                });
            });
            if (window.parallax.background.offset.x) {
                $('body').css({
                    'background-position': (window.parallax.background.offset.x / window.devicePixelRatio +
                                            ((window.parallax.transform.x() / 20) *
                                              window.parallax.distance)) + 'px ' +
                                           (window.parallax.background.offset.y / window.devicePixelRatio +
                                            ((window.parallax.transform.y() / 20) *
                                              window.parallax.distance)) + 'px'
                });
            }
        },
    };

    (function setup() {
        if (window.parallax.debug) {
            console.log('setup');
        }
        var body_img_src = getComputedStyle(document.getElementsByTagName('body')[0]).backgroundImage.replace('url(', '').replace(')', '').replace('"', '').replace("'", '');
        var body_img = new Image();
        body_img.onload = function() {
            window.parallax.background.x = this.width;
            window.parallax.background.y = this.height;
            calibrate();
        }
        body_img.src = body_img_src;

        var calibrate = function(e) {
            if (window.parallax.debug) {
                console.log('calibrate');
            }
            if (e) {
                window.parallax.calibration.alpha = e.alpha > 180 ? e.alpha - 360 : e.alpha;
                window.parallax.calibration.beta = e.beta;
                window.parallax.calibration.gamma = e.gamma;
            }
            if (window.parallax.background.x) {
                window.parallax.background.offset.x = -((window.parallax.background.x / window.devicePixelRatio) - window.innerWidth) / 2;
                window.parallax.background.offset.y = -((window.parallax.background.y / window.devicePixelRatio) - window.innerHeight) / 2;
            }
            if (window.parallax.debug) {
                $('.alphac').text(window.parallax.calibration.alpha.toFixed(2));
                $('.betac').text(window.parallax.calibration.beta.toFixed(2));
                $('.gammac').text(window.parallax.calibration.gamma.toFixed(2));
            }
            window.removeEventListener('deviceorientation', calibrate, false);
        }

        var setOrientation = function(e) {
            if (window.parallax.debug) {
                console.log('setting orientation');
            }
            window.parallax.orientation = window.orientation;
            switch (window.parallax.orientation) {
                case 90: // landscape, top to the left
                    window.parallax.transform.x = function() {
                        var gamma = window.parallax.device.gamma;
                        var beta = window.parallax.device.beta - window.parallax.calibration.beta
                        var alpha = window.parallax.device.alpha - window.parallax.calibration.alpha;
                        alpha = alpha > 180 ? alpha - 360 : alpha;
                        return -beta * (gamma + 90) / 90 // weight by gamma + 90, to stop z from screen rotation
                            + alpha * (gamma / 90); // weighted by gamma to stop z from screen rotation:w
                    };
                    window.parallax.transform.y = function() {
                        return window.parallax.device.gamma - window.parallax.calibration.gamma;
                    };
                    break;
                case 0: // portrait, right side up
                    window.parallax.transform.x = function() {
                        var beta = window.parallax.device.beta;
                        var gamma = window.parallax.device.gamma - window.parallax.calibration.gamma;
                        var alpha = window.parallax.device.alpha - window.parallax.calibration.alpha;
                        alpha = alpha > 180 ? 360 - alpha : -alpha;
                        return -gamma +
                            alpha * beta / 90;
                    };
                    window.parallax.transform.y = function() {
                        return -(window.parallax.device.beta - window.parallax.calibration.beta);
                    };
                    break;
                case -90: // landscape, bottom to the left
                    window.parallax.transform.x = function() {
                        var gamma = window.parallax.device.gamma;
                        var beta = window.parallax.device.beta - window.parallax.calibration.beta;
                        var alpha = window.parallax.device.alpha - window.parallax.calibration.alpha;
                        alpha = alpha > 180 ? alpha - 360 : alpha;
                        return beta * (gamma - 90) / 90 // weight by gamma - 90, to stop z from screen rotation
                            + alpha * (gamma / 90); // weighted by gamma to stop z from screen rotation:w

                    };
                    window.parallax.transform.y = function() {
                        return -(window.parallax.device.gamma - window.parallax.calibration.gamma);
                    };
                    break;
                case 180: // portrait, upside down
                    window.parallax.transform.x = function() {
                        var beta = window.parallax.device.beta;
                        var gamma = window.parallax.device.gamma - window.parallax.calibration.gamma;
                        var alpha = window.parallax.device.alpha - window.parallax.calibration.alpha;
                        alpha = alpha > 180 ? 360 - alpha : -alpha;
                        return gamma -
                            alpha * beta / 90;
                    };
                    window.parallax.transform.y = function() {
                        return window.parallax.device.beta - window.parallax.calibration.beta;
                    };
                    break;
            }
        }
        // acceleration data
        /*window.addEventListener('MozOrientation', function(e) {
            window.parallax.device.x = e.x;
            window.parallax.device.y = e.y;
            window.parallax.device.z = e.z;
        }, true);
        window.addEventListener('devicemotion', function(e) {
            window.parallax.device.x = e.x;
            window.parallax.device.y = e.y;
            window.parallax.device.z = e.z;
        }, true);*/
        window.addEventListener('deviceorientation', function(e) {
            window.parallax.device.alpha = e.alpha;
            window.parallax.device.beta = e.beta;
            window.parallax.device.gamma = e.gamma;
            if (window.parallax.debug) {
                $('.alpha').text(e.alpha.toFixed(2));
                $('.beta').text(e.beta.toFixed(2));
                $('.gamma').text(e.gamma.toFixed(2));
            }
        }, true);
        var orientate = function() {
            setOrientation();
            window.addEventListener('deviceorientation', calibrate, false);
        }
        window.addEventListener('orientationchange', orientate, false);
        orientate();
    })();

    if (window.DeviceOrientationEvent) {
        (function animloop() {
            requestAnimationFrame(animloop);
            window.parallax.render();
        })();
    }
})();
