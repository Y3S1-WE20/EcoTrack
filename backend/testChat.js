const nlpService = require('./services/nlpService');

console.log('Testing isActivityRelated function:');
console.log('Is "hi" activity related?', nlpService.isActivityRelated('hi'));
console.log('Is "hello" activity related?', nlpService.isActivityRelated('hello'));
console.log('Is "hey there" activity related?', nlpService.isActivityRelated('hey there'));
console.log('Is "I drove 5km" activity related?', nlpService.isActivityRelated('I drove 5km'));
console.log('Is "good morning" activity related?', nlpService.isActivityRelated('good morning'));