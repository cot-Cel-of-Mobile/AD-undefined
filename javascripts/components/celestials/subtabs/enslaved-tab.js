"use strict";

Vue.component("enslaved-tab", {
  data: () => ({
    isStoringBlackHole: false,
    isStoringReal: false,
    autoStoreReal: false,
    hasAmplifyStoredReal: false,
    hasStoredTimeSpeedBoost: false,
    canAdjustStoredTime: false,
    storedTimeSpeedValue: 1,
    inEnslaved: false,
    storedBlackHole: 0,
    storedReal: 0,
    storedRealEffiency: 0,
    storedRealCap: 0,
    unlocks: [],
    quote: "",
    quoteIdx: 0,
  }),
  computed: {
    amplifiedGameDesc() {
      return `^${RA_UNLOCKS.IMPROVED_STORED_TIME.effect.gameTimeAmplification().toFixed(2)}`;
    },
    storedTimeBoostDesc() {
      return formatX(this.storedTimeSpeedValue, 2, 2);
    },
    storedRealEfficiencyDesc() {
      return formatPercents(this.storedRealEffiency);
    },
    storedRealCapDesc() {
      return timeDisplayShort(this.storedRealCap);
    },
    unlocksInfo() {
      return ENSLAVED_UNLOCKS;
    },
    nerfedBlackHoleTime() {
      return Enslaved.storedTimeInsideEnslaved(this.storedBlackHole);
    },
    realityTitle() {
      return this.inEnslaved
        ? "You're inside Enslaved Ones' Reality"
        : "Start Enslaved One's Reality";
    },
    sliderProps() {
      return {
        min: 0,
        max: 1000,
        interval: 1,
        show: true,
        width: "60rem",
        tooltip: false
      };
    },
  },
  methods: {
    update() {
      this.isStoringBlackHole = player.celestials.enslaved.isStoring;
      this.storedBlackHole = player.celestials.enslaved.stored;
      this.isStoringReal = player.celestials.enslaved.isStoringReal;
      this.autoStoreReal = player.celestials.enslaved.autoStoreReal;
      this.hasAmplifyStoredReal = Ra.has(RA_UNLOCKS.IMPROVED_STORED_TIME);
      this.hasStoredTimeSpeedBoost = Ra.has(RA_UNLOCKS.GAMESPEED_BOOST);
      this.canAdjustStoredTime = Ra.has(RA_UNLOCKS.ADJUSTABLE_STORED_TIME);
      this.storedTimeSpeedValue = Ra.gamespeedStoredTimeMult();
      this.inEnslaved = Enslaved.isRunning;
      this.storedReal = player.celestials.enslaved.storedReal;
      this.storedRealEffiency = Enslaved.storedRealTimeEfficiency;
      this.storedRealCap = Enslaved.storedRealTimeCap;
      this.unlocks = player.celestials.enslaved.unlocks;
      this.quote = Enslaved.quote;
      this.quoteIdx = player.celestials.enslaved.quoteIdx;
    },
    toggleStoreBlackHole() {
      Enslaved.toggleStoreBlackHole();
    },
    toggleStoreReal() {
      Enslaved.toggleStoreReal();
    },
    toggleAutoStoreReal() {
      Enslaved.toggleAutoStoreReal();
    },
    useStored() {
      Enslaved.useStoredTime();
    },
    timeDisplayShort(ms) {
      return timeDisplayShort(ms);
    },
    buyUnlock(info) {
      Enslaved.buyUnlock(info);
    },
    startRun() {
      Enslaved.startRun();
    },
    hasUnlock(info) {
      return Enslaved.has(info);
    },
    canBuyUnlock(info) {
      return Enslaved.canBuy(info);
    },
    nextQuote() {
      Enslaved.nextQuote();
    },
    hasNextQuote() {
      return this.quoteIdx < Enslaved.maxQuoteIdx;
    },
    unlockClassObject(info) {
      return {
        "o-enslaved-shop-button--bought": this.hasUnlock(info), 
        "o-enslaved-shop-button--available": this.canBuyUnlock(info)
      };
    },
    adjustSlider(value) {
      player.celestials.enslaved.storedFraction = value / 1000;
    },
  },
  template:
    `<div class="l-enslaved-celestial-tab">
      <div class="o-teresa-quotes"> {{ quote }}</div>
      <button class="o-quote-button" @click="nextQuote()" v-if="hasNextQuote()">→</button>
      <div class="l-enslaved-top-container">
        <div class="l-enslaved-top-container__half">
          <button :class="['o-enslaved-mechanic-button',
                           {'o-enslaved-mechanic-button--storing-time': isStoringBlackHole }]"
                  @click="toggleStoreBlackHole">
            <div class="o-enslaved-stored-time">{{ timeDisplayShort(storedBlackHole) }}</div>
            <div>{{ isStoringBlackHole ? "Storing black hole time": "Store black hole time" }}</div>
          </button>
          <button class="o-enslaved-mechanic-button" @click="useStored">
            Use stored black hole time
            <p v-if="inEnslaved">{{timeDisplayShort(nerfedBlackHoleTime)}} in this reality</p>
          </button>
          <div v-if="hasAmplifyStoredReal"> Amplified: {{ amplifiedGameDesc }} </div>
          <div v-if="hasStoredTimeSpeedBoost"> Game speed: {{ storedTimeBoostDesc }} </div>
        </div>
        <div class="l-enslaved-top-container__half">
          <button :class="['o-enslaved-mechanic-button',
                           {'o-enslaved-mechanic-button--storing-time': isStoringReal}]"
                  @click="toggleStoreReal">
            <div class="o-enslaved-stored-time">{{ timeDisplayShort(storedReal) }}</div>
            <div>{{ isStoringReal ? "Storing real time": "Store real time" }}</div>
          </button>
          <button :class="['o-enslaved-mechanic-button',
                           {'o-enslaved-mechanic-button--storing-time': autoStoreReal}]"
                  @click="toggleAutoStoreReal">
            <div>{{ autoStoreReal ? "Offline time stored": "Offline time used for production" }}</div>
          </button>
          <div> Efficiency: {{ storedRealEfficiencyDesc }} </div>
          <div> Maximum: {{ storedRealCapDesc }} </div>
        </div>
      </div>
      <div v-if="canAdjustStoredTime" class="l-enslaved-shop-container">
        <ad-slider-component
            v-bind="sliderProps"
            @input="adjustSlider($event)"
          />
      </div>
      <div class="l-enslaved-shop-container">
        <button
          v-for="unlock in unlocksInfo"
          :key="unlock.id"
          class="o-enslaved-shop-button"
          :class="unlockClassObject(unlock)"
          @click="buyUnlock(unlock)"> {{ unlock.description }} <br> Costs: {{ timeDisplayShort(unlock.price) }}</button>
      </div>
      <div class="l-enslaved-unlocks-container" v-if="hasUnlock(unlocksInfo.RUN)">
        <button class="o-enslaved-run-button" @click="startRun">
          <div class="o-enslaved-run-button__title">{{realityTitle}}</div>
          <p>ID, TD, and 8th dimension purchases are limited to 1 each.</p>
          <p>Normal dimension multipliers are always dilated (the glyph effect still only
             applies in actual dilation)</p>
          <p>Time study 192 is locked</p>
          <p>The black hole is disabled</p>
          <p>Tachyon production and dilated time production are severely reduced</p>
          <p>Time theorem generation from dilation glyphs is much slower</p>
          <p>Certain challenge goals have been increased</p>
          <p>Stored time is much less effective</p>
          <p>Reward: ID purchase caps are increased by 1000 for every 1000 free tickspeed upgrades you get</p>
        </button>
        </div>
    </div>`
});
