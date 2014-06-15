/**
 * @file class test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var Class = require('lib/class');

    var Pig;
    describe('class init', function () {
        it('create',function (){

             Pig = Class.create({
                initialize:function(name) {
                    this.name = name;
                },
                task:function() {
                    console.log('i am a ', this.name);
                }
            });

            var zhu = new Pig('zhu');
            expect(zhu.name).toBe('zhu');
        });

        it('extend',function (){


            var RedPig = Pig.extend({
               initialize:function(name) {
                   RedPig.superClass.initialize.call(this, name);
               },
               color:'red'
            });

            var redZhu = new RedPig('qq');
            expect(redZhu.color).toBe('red');
            expect(redZhu.name).toBe('qq');

        });

        it('implement', function (){
           var changeImp={
               changeValue:function(key,value) {
                   this[key] = value;
               }
           };
            Pig.implement(changeImp);

            var changePig = new Pig('zhu');


            changePig.changeValue('name','qq');

            expect(changePig.name).toBe('qq');
        });

    });
});