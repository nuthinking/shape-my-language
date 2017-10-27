var unittestFailures = [];

function assertEquals (message, expected, actual){
    if(actual != expected){
        fail(message + " - expected:\"" + expected + "\" actual:\"" + actual + "\"");
    }
}

function assertSame (message, expected, actual){
    if(actual !== expected){
        fail(message + " - expected:\"" + expected + "\" actual:\"" + actual + "\"");
    }
}

function assertTrue (message, condition){
    if(!condition){
        fail(message);
    }
}

function fail (message){
    unittestFailures.push(message);
}
