/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-19 下午12:37
 */
LBF.define('util.Tasks', function(require){
    var proxy = require('lang.proxy');

    //requestAnimationFrame will stop functioning when page is out of vision
    /**
     * requestAnimationFrame
     */
    /*
     var timer = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
     window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (fn) { setTimeout(fn, 13);};
     */


    var TASK_RUN = 'run', // task state: running
        TASK_PAUSE = 'pause', // task state: pauseed
        TASK_DROP = 'drop', // task state: to be dropped
        LOOP_TIME = 16; // execution time in a loop

    /**
     * Task list management.
     * util.Tasks is a single instance class
     * High performance version of setInterval and provide super easy task management.
     * Suitable for animation or timely running tasks
     * @class Tasks
     * @module util
     * @namespace util
     */
    var Tasks = {
        /**
         * Add a new task
         * Newly added task is paused, manually run it when needed
         * @method add
         * @param {Function} fn Things to be done each time is up
         * @param {Number|Function} gap The time gap between two execution
         * @return {Task} Task instance for further control
         */
        add: function(fn, gap){
            var t = new Task(fn, gap);
            circle.push(t);

            if(circle.length > 0){
                this.start();
            }

            return t;
        },

        /**
         * Add an once task.
         * The task added by Tasks.once will only run once and automatically removed itself
         * @method once
         * @param {Function} fn Things to be done each time is up
         * @param {Number|Function} gap The time gap between two execution
         * @return {Task} Task instance for further control
         */
        once: function(fn, gap){
            return this.add(function(){
                // drop before callback
                // otherwise when callback throws errors, task would not be dropped
                // and continue running again and again
                this.drop();

                fn.apply(this, arguments);

            }, gap);
        },

        /**
         * main loop, execute tasks in sequence and stop when loop time is up
         * @method loop
         * @private
         */
        loop: function(){
            var c = circle,
                count = c.length,
                start = +new Date(),
                loopTime = LOOP_TIME,
                t = c[pos];

            while(count > 0 && +new Date() - start < loopTime){
                if(!t){
                    break;
                }

                if(t.isRunning()){
                    t.execute();
                } else if(t.isDropped()){
                    c.splice(pos, 1);
                    pos--;
                }

                // when no task is on the list
                // stop timer for better performance
                if(c.length === 0){
                    this.stop();
                    break;
                }

                pos = (pos + 1) % c.length;
                t = c[pos];
                count--;
            }
        },

        /**
         * Start loop
         * @method start
         * @private
         * @chainable
         */
        start: function(){
            if(this.timer){
                return this;
            }

            // todo
            // loop time can be automatically judged

            // todo
            // timer can be separated into 2
            // one for always running loop using setInterval and the other for dom render use requestAnimationFrame
            this.timer = setInterval(proxy(this.loop, this), LOOP_TIME);

            // reset pos
            pos = 0;

            return this;
        },

        /**
         * Stop loop
         * @method stop
         * @private
         * @chainable
         */
        stop: function(){
            if(this.timer){
                clearInterval(this.timer);
                this.timer = null;
            }

            return this;
        }
    };

    var circle = [],
        pos = 0;

    /**
     * Task control handler representing a function to be executed every certain time
     * @class Task
     */
    var Task = function(fn, gap){
        this.fn = fn;
        this.gap = gap;
        this.delayedTime = 0;
        this.status = TASK_PAUSE;
        this.lastExecTime = +new Date();
    };

    Task.prototype = {
        /**
         * Set task's state to running
         * @method run
         * @param {Boolean} immediately Run immediately or wait a gap
         * @chainable
         */
        run: function(immediately){
            this.status = TASK_RUN;
            immediately && (this.lastExecTime = 0);
            return this;
        },

        /**
         * Set task's state to paused
         * @method pause
         * @chainable
         */
        pause: function(){
            this.status = TASK_PAUSE;
            return this;
        },

        /**
         * Drop ( remove ) the task
         * The task will be removed the next time it ought to be executed.
         * Reset task's state before it's really removed by calling run or pause can restore the task
         * @method drop
         * @chainable
         */
        drop: function(){
            this.status = TASK_DROP;
            return this;
        },

        /**
         * Delay execution time
         * @method delay
         * @param {Number} delayedTime
         * @chainable
         */
        delay: function(delayedTime){
            this.delayedTime = delayedTime;
            return this;
        },

        /**
         * Execution
         * @method execute
         * @private
         * @return {boolean}
         */
        execute: function(){
            if(+new Date() - this.lastExecTime - this.delayedTime < this.gap){
                return false;
            }

            this.fn();
            this.lastExecTime = +new Date();
            this.delayedTime = 0;
            return true;
        },

        /**
         * Get time gap
         * @method getGap
         * @return {Number}
         */
        getGap: function(){
            return this.gap;
        },

        /**
         * Set time gap
         * @method setGap
         * @param {Number} newGap
         * @chainable
         */
        setGap: function(newGap){
            this.gap = newGap;
            return this;
        },

        /**
         * Judge whether the task is in running state or not
         * @method isRunning
         * @return {boolean}
         */
        isRunning: function(){
            return this.status === TASK_RUN;
        },

        /**
         * Judge whether the task is paused or not
         * @method isPaused
         * @return {boolean}
         */
        isPaused: function(){
            return this.status === TASK_PAUSE;
        },

        /**
         * Judge whether the task is dropped or not
         * @method isDropped
         * @returns {boolean}
         */
        isDropped: function(){
            return this.status === TASK_DROP;
        }
    };

    return Tasks;
});