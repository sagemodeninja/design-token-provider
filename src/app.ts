import { DesignToken } from './design-token-provider';

const target = document.getElementById('test');
const colorToken = new DesignToken('test-color');
const anotherToken = new DesignToken('another-color');

colorToken.subscribeFor(target, (oldValue, newValue) => {
    console.log(oldValue, newValue);
});

colorToken.setDefault('red');
anotherToken.setDefault('blue');
colorToken.setValueFor(target, 'green');
colorToken.setValueFor(target, 'orange');
