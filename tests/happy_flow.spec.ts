import { expect } from 'chai';
import { Browser, Builder, By, until, WebDriver } from 'selenium-webdriver';

let driver: WebDriver;

describe('Test Suite for saucedemo.com', () => {
  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    await driver.quit();
  });

  it('should login to saucedemo.com', async function () {
    await driver.get('https://www.saucedemo.com/');
    await driver.findElement(By.name('user-name')).sendKeys('standard_user');
    await driver.findElement(By.name('password')).sendKeys('secret_sauce');
    await driver.findElement(By.css('input[type="submit"]')).click();

    //check that the user has successfully logged in and after that the menu on the page is displayed
    const menuButton = await driver.findElement(By.id('react-burger-menu-btn'));
    await menuButton.click(); // Открытие меню

    const menu = await driver.findElement(By.id('inventory_sidebar_link'));
    await driver.wait(until.elementIsVisible(menu), 10000); // had a visibility problem, added an explicit wait
    const menuText = await menu.getText();
    console.log('Menu text:', menuText);
    expect(menuText).to.equal('All Items');
  });

  it('should add items to the cart', async function () {
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    const badge = await driver.findElement(By.css('.shopping_cart_badge'));
    const badgeText = await badge.getText();
    expect(badgeText).to.equal('1');
  });

  it('should check the cart', async function () {
    //verify that the correct url has been opened
    await driver.findElement(By.css('.shopping_cart_badge')).click();
    const cartUrl = await driver.getCurrentUrl();
    expect(cartUrl).to.equal('https://www.saucedemo.com/cart.html');

    //verify that the correct product was added
    const item = await driver
      .findElement(
        By.css('.inventory_item_name[data-test="inventory-item-name"]')
      )
      .getText();
    expect(item).to.equal('Sauce Labs Backpack');
  });

  it('should checkout', async function () {
    //verify that the correct url has been opened
    await driver.findElement(By.name('checkout')).click();

    const checkoutUrlStepOne = await driver.getCurrentUrl();
    expect(checkoutUrlStepOne).to.equal(
      'https://www.saucedemo.com/checkout-step-one.html'
    );

    await driver.findElement(By.name('firstName')).sendKeys('user');
    await driver.findElement(By.name('lastName')).sendKeys('standard');
    await driver.findElement(By.name('postalCode')).sendKeys('123456');

    await driver.findElement(By.name('continue')).click();

    const checkoutUrlStepTwo = await driver.getCurrentUrl();
    expect(checkoutUrlStepTwo).to.equal(
      'https://www.saucedemo.com/checkout-step-two.html'
    );

    //verify that the correct product displaed
    const finishCheck = await driver
      .findElement(
        By.css('.inventory_item_name[data-test="inventory-item-name"]')
      )
      .getText();
    expect(finishCheck).to.equal('Sauce Labs Backpack');
    const count = await driver.findElement(By.css('.cart_quantity'));
    const countText = await count.getText();
    expect(countText).to.equal('1');
  });

  it('should finish order', async function () {
    await driver.findElement(By.name('finish')).click();
    const finishUrl = await driver.getCurrentUrl();
    expect(finishUrl).to.equal(
      'https://www.saucedemo.com/checkout-complete.html'
    );
    const confirmationText = await driver
      .findElement(By.css('.complete-header'))
      .getText();
    expect(confirmationText).to.equal('Thank you for your order!');
  });
});
