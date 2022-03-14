/**
 * A basic game entity with a animation to be displayed in the game.
 */

 import { Entity } from "./Entity";
 import { Animation } from "../Core/Animation";
 import { Canvas } from "../Core/Canvas";
 import { ImageManager } from "../Core/ImageManager";
import { ANIMATION_FRAME_SPEED_MS } from "../Constants";
  
 export abstract class AnimationEntity<AnimationStates> extends Entity {

    /**
     * What state the rhino is currently in.
     */
    state: AnimationStates | null = null;

    /**
     * The current frame of the current animation the entity is on.
     */
    curAnimationFrame: number = 0;

    /**
     * The time in ms of the last frame change. Used to provide a consistent framerate.
     */
    curAnimationFrameTime: number = Date.now();
 
    /**
     * Stores all of the animations available for the different states of the animation entity.
     */
    animations: {[key: string]: Animation} = {};

    /**
     * The animation that the animation entity is currently using. Typically matches the state the entity is in.
     */
    curAnimation: Animation | null = null;

    /**
     * Initialize animation state
     */
    constructor(x: number, y: number, imageManager: ImageManager, canvas: Canvas, initialState: AnimationStates | null) {
        super(x, y, imageManager, canvas);
        
        this.state = initialState;
        this.setupAnimations();
    }

    abstract setupAnimations(): void;

    /**
     * Set the current animation, reset to the beginning of the animation and set the proper image to display.
     */
    setAnimationState(state: string) {
        if (!this.state) {
            return;
        }

        this.curAnimation = this.animations[state];
        if(!this.curAnimation) {
            return;
        }

        this.curAnimationFrame = 0;

        const animateImages = this.curAnimation.getImages();
        this.imageName = animateImages[this.curAnimationFrame];
    }

    /**
     * Increase the current animation frame and update the image based upon the sequence of images for the animation.
     * If the animation isn't looping, then finish the animation instead.
     */
     nextAnimationFrame(gameTime: number) {
        if(!this.curAnimation) {
            return;
        }

        const animationImages = this.curAnimation.getImages();

        this.curAnimationFrameTime = gameTime;
        this.curAnimationFrame++;
        if (this.curAnimationFrame >= animationImages.length) {
            if(!this.curAnimation.getLooping()) {
                this.finishAnimation();
                return;
            }

            this.curAnimationFrame = 0;
        }

        this.imageName = animationImages[this.curAnimationFrame];
    }

    /**
     * The current animation wasn't looping, so finish it by clearing out the current animation and firing the callback.
     */
    finishAnimation() {
        if(!this.curAnimation) {
            return;
        }

        const animationCallback = this.curAnimation.getCallback();
        this.curAnimation = null;

        if(animationCallback) {
            animationCallback.apply(null);
        }
    }

    /**
     * Advance to the next frame in the current animation if enough time has elapsed since the previous frame.
     */
     animate(gameTime: number) {
        if(!this.curAnimation) {
            return;
        }

        if(gameTime - this.curAnimationFrameTime > ANIMATION_FRAME_SPEED_MS) {
            this.nextAnimationFrame(gameTime);
        }
    }
 }