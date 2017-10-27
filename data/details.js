var fontDetails;

(function(){

    var cd = function (lett, x, y, options)
    {
        return new Detail(lett, x, y, options);
    };
    
    fontDetails = 
    [
        // regular
        cd('a', 0.19, 0.82, {radius:0.18}),
        cd('e', 0.81, 0.67, {radius: 0.20}),
        cd('i', 0.5, 0.385),
        cd('o', 0.27, 0.54),
        cd('u', 0.76, 0.889),
        cd('t', 0.245, 0.8),
        cd('r', 0.365, 0.519),
        cd('z', 0.23, 0.482),
        cd('b', 0.293, 0.523),
        cd('j', 0.47, 1.059),

        // bold
        cd('a', 0.81, 0.919, {style: 'bold'}),
        cd('e', 0.8, 0.9, {style: 'bold'}),
        cd('i', 0.63, 0.378, {style: 'bold'}),
        cd('o', 0.87, 0.7, {style: 'bold'}),
        cd('u', 0.623, 0.855, {style: 'bold'}),
        cd('t', 0.88, 0.9, {style: 'bold'}),
        cd('r', 0.55, 0.56, {style: 'bold'}),
        cd('z', 0.19, 0.895, {style: 'bold'}),
        cd('b', 0.38, 0.85, {style: 'bold'}),
        cd('j', -0.1, 1.09, {style: 'bold'}),
        
        // italic
        cd('a', 0.81, 0.88, {style: 'italic'}),
        cd('e', 0.397, 0.696, {style: 'italic'}),
        cd('i', 1.0, 0.385, {style: 'italic'}),
        cd('o', 0.92, 0.74, {style: 'italic'}),
        cd('u', 0.79, 0.8, {style: 'italic'}),
        cd('t', 0.445, 0.865, {style: 'italic'}),
        cd('r', 0.535, 0.7, {style: 'italic'}),
        cd('z', 0.25, 0.93, {style: 'italic'}),
        cd('b', 0.91, 0.74, {style: 'italic'}),
        cd('j', -0.1, 1.13, {style: 'italic'}),

        // bold italic
        cd('a', 0.72, 0.848, {style: 'bold italic'}),
        cd('e', 0.465, 0.838, {style: 'bold italic'}),
        cd('i', 0.465, 0.92, {style: 'bold italic'}),
        cd('o', 0.59, 0.567, {style: 'bold italic'}),
        cd('u', 0.675, 0.925, {style: 'bold italic'}),
        cd('t', 0.785, 0.34, {style: 'bold italic'}),
        cd('r', 0.56, 0.525, {style: 'bold italic'}),
        cd('z', 0.25, 0.93, {style: 'bold italic'}),
        cd('b', 0.75, 0.557, {style: 'bold italic'}),
        cd('j', 0.78, 0.382, {style: 'bold italic'})
    ];
    

})();
