"use strict";

Vue.component('new-galaxy-row', {
  data() {
    return {
      type: GalaxyType.NORMAL,
      galaxies: {
        normal: 0,
        replicanti: 0,
        dilation: 0
      },
      requirement: {
        tier: 1,
        amount: 0
      },
      canBeBought: false,
      distantStart: 0,
      lockText: null
    };
  },
  computed: {
    dimName() {
      return DISPLAY_NAMES[this.requirement.tier];
    },
    buttonText() {
      return this.lockText === null
        ? "Lose all your previous progress, but get a tickspeed boost"
        : this.lockText;
    },
    sumText() {
      const parts = [this.galaxies.normal];
      if (this.galaxies.replicanti > 0) parts.push(this.galaxies.replicanti);
      if (this.galaxies.dilation > 0) parts.push(this.galaxies.dilation);
      const sum = parts.map(shortenSmallInteger).join(" + ");
      if (parts.length >= 2) {
        return `${sum} = ${parts.sum()}`;
      }
      return sum;
    },
    typeName() {
      switch (this.type) {
        case GalaxyType.NORMAL: return "Antimatter Galaxies";
        case GalaxyType.DISTANT: return "Distant Antimatter Galaxies";
        case GalaxyType.REMOTE: return "Remote Antimatter Galaxies";
      }
      return undefined;
    },
    hasIncreasedScaling() {
      return this.type !== GalaxyType.NORMAL;
    },
    costScalingText() {
      switch (this.type) {
        case GalaxyType.DISTANT:
          return `Each galaxy is more expensive past ${this.distantStart} galaxies`;
        case GalaxyType.REMOTE:
          return "Increased galaxy cost scaling: " +
            `Quadratic past ${this.distantStart} (distant), exponential past 800 (remote)`;
      }
      return undefined;
    }
  },
  methods: {
    update() {
      this.type = Galaxy.type;
      this.galaxies.normal = player.galaxies;
      this.galaxies.replicanti = Replicanti.galaxies.total;
      this.galaxies.dilation = player.dilation.freeGalaxies;
      const requirement = Galaxy.requirement;
      this.requirement.amount = requirement.amount;
      this.requirement.tier = requirement.tier;
      this.canBeBought = requirement.isSatisfied && Galaxy.canBeBought;
      this.distantStart = EternityChallenge(5).isRunning ? 0 : Galaxy.costScalingStart;
      this.lockText = this.generateLockText();
    },
    generateLockText() {
      if (Galaxy.canBeBought) return null;
      if (EternityChallenge(6).isRunning) return "Locked (Eternity Challenge 6)";
      if (InfinityChallenge(7).isRunning) return "Locked (Infinity Challenge 7)";
      if (NormalChallenge(8).isRunning) return "Locked (8th Dimension Autobuyer Challenge)";
      return null;
    }
  },
  template:
  `<div class="reset-container galaxy">
    <h4>{{typeName}} ({{sumText}})</h4>
    <span>Requires: {{shortenSmallInteger(requirement.amount)}} {{dimName}} D</span>
    <div v-if="hasIncreasedScaling">{{costScalingText}}</div>
    <button 
      class="storebtn" style="height: 56px; font-size: 1rem;"
      :class="{ 'storebtn-unavailable': !canBeBought }"
      onclick="galaxyResetBtnClick()"
      :enabled="canBeBought"
    >{{buttonText}}</button>
  </div>`
})