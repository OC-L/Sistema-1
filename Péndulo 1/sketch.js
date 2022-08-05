

let masterVolume = -7;
let ready = false;

let pendulums = [];

let scale;

let mixer;

//------------------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
}

//------------------------------------------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//------------------------------------------------------------

function draw() {
  background(0);

  if (ready) {
    for (let p of pendulums) {
      p.run();
      translate(0, height / (pendulums.length+1));
    }
  } else {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("click", width / 2, height / 2);
  }
}

//------------------------------------------------------------

function mousePressed() {
  if (!ready) {
    initializeAudio();
    ready = true;
  }
}

//------------------------------------------------------------

function initializeAudio() {
  Tone.Master.volume.value = masterVolume;

  mixer = new Tone.Gain();

  let reverb = new Tone.Reverb({
    wet: .4, // half dry, half wet mix
    decay: 7 // decay time in seconds
  });
  
  const chorus = new Tone.Chorus(4, 2.5, 2).toDestination().start();
  
  const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();
  
  mixer.connect(reverb);
  reverb.connect(chorus);
  chorus.connect(tremolo);
  tremolo.toDestination();

  let flavour = "chromatic";
  scale = Tonal.Scale.get("E0" + flavour).notes;
  scale = scale.concat(Tonal.Scale.get("F#0 " + flavour).notes);
  scale = scale.concat(Tonal.Scale.get("C1 " + flavour).notes);
  
  Tonal.Collection.shuffle(scale);

  for (let i = 0; i < scale.length; i++) {
    pendulums[i] = new Pendulum(0.95 + i * (1 / 60), scale[i]);
  }
}

//------------------------------------------------------------

class Pendulum {
  
  constructor(freq, note) {
    this.freq = freq * 0.1;
    this.note = note;

    this.lfo = new Tone.LFO(this.freq);
    this.lfo.start(1);
    this.meter = new Tone.Meter();
    this.meter.normalRange = 1;
    this.lfo.connect(this.meter);

    this.synth = new Tone.MembraneSynth();
    this.synth.connect(mixer);

    this.prevPos = 0;
  }

  run() {
    let pos = 0.5 - this.meter.getValue(0);
    
    let border = max(100, (width - 300) / 2);
    let x = map(pos, -0.5, 0.5, border, width - border);

    let left = pos > 0 && this.prevPos < 0;
    let right = pos < 0 && this.prevPos > 0;
    if (left || right) {
      this.synth.triggerAttackRelease(this.note, "64n");
    }
    this.prevPos = pos;

    fill(255);
    stroke(255);
    line(x, 20, width / 2, 0);
    ellipse(x, 20, 20, 20);    
  }
}
