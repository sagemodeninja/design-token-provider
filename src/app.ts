import { DesignToken } from './design-token-provider';

const target = document.getElementById('test');
const colorToken = new DesignToken('test-color');
const anotherToken = new DesignToken('another-color');

colorToken.setDefault('red');
anotherToken.setDefault('blue');
colorToken.setValueFor(target, 'green');