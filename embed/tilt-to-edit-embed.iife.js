var TiltToEdit=(function(C){"use strict";var St=Object.defineProperty;var wt=(C,w,I)=>w in C?St(C,w,{enumerable:!0,configurable:!0,writable:!0,value:I}):C[w]=I;var y=(C,w,I)=>wt(C,typeof w!="symbol"?w+"":w,I);function w(e,t,n){return{code:e,message:t,detail:n}}function I(e){const t=e.document,n=t.permissionsPolicy??t.featurePolicy;if(typeof(n==null?void 0:n.allowsFeature)!="function")return null;const i=n.allowsFeature("accelerometer"),s=n.allowsFeature("gyroscope");return i&&s?null:w("permissions-policy","Tilt input is blocked by the current permissions policy.","Enable accelerometer and gyroscope access for this origin or iframe.")}class tt{constructor(t={}){y(this,"name","device-orientation");y(this,"listeners",new Set);y(this,"now");y(this,"windowObject");y(this,"eventHandler");this.windowObject=t.window,this.now=t.now??(()=>Date.now())}getWindowObject(){if(this.windowObject)return this.windowObject;if(typeof window<"u")return window}getRequestableConstructor(){const t=this.getWindowObject();return t==null?void 0:t.DeviceOrientationEvent}getPermissionRequester(){const t=this.getWindowObject(),n=this.getRequestableConstructor();return typeof(n==null?void 0:n.requestPermission)=="function"?n:t==null?void 0:t.DeviceMotionEvent}supportsOrientationEvents(){const t=this.getWindowObject();return t?this.getRequestableConstructor()?!0:"ondeviceorientation"in t||"ondeviceorientationabsolute"in t:!1}getAvailability(){var i;const t=this.getWindowObject();if(!t)return{supported:!1,permissionRequired:!1,blockedDiagnostic:w("unsupported-api","Tilt input is not available outside a browser window.")};if(!t.isSecureContext)return{supported:!0,permissionRequired:!1,blockedDiagnostic:w("insecure-context","Tilt input requires a secure context.","Serve the app over HTTPS or localhost.")};const n=I(t);return n?{supported:!0,permissionRequired:!1,blockedDiagnostic:n}:this.supportsOrientationEvents()?{supported:!0,permissionRequired:typeof((i=this.getPermissionRequester())==null?void 0:i.requestPermission)=="function"}:{supported:!1,permissionRequired:!1,blockedDiagnostic:w("unsupported-api","DeviceOrientationEvent is not supported in this browser.")}}async requestPermission(){const t=this.getPermissionRequester();if(!(t!=null&&t.requestPermission))return"granted";try{return await t.requestPermission()}catch{return"denied"}}subscribe(t){return this.listeners.add(t),this.ensureListener(),()=>{this.listeners.delete(t),this.listeners.size===0&&this.teardownListener()}}ensureListener(){if(this.eventHandler)return;const t=this.getWindowObject();t&&(this.eventHandler=n=>{if(n.beta==null||n.gamma==null)return;const i={alpha:n.alpha,beta:n.beta,gamma:n.gamma,absolute:n.absolute,timestamp:this.now()};for(const s of this.listeners)try{s.onSample(i)}catch(r){const a=r instanceof Error?r:new Error(String(r));s.onError(a)}},t.addEventListener("deviceorientation",this.eventHandler))}teardownListener(){const t=this.getWindowObject();!t||!this.eventHandler||(t.removeEventListener("deviceorientation",this.eventHandler),this.eventHandler=void 0)}}function Y(e={}){return new tt(e)}function V(e=0,t=0){return{x:e,y:t,magnitude:Math.hypot(e,t)}}function _(e,t,n){return Math.min(Math.max(e,t),n)}function N(e){const t=(Math.round(e/90)*90%360+360)%360;return t===0||t===90||t===180||t===270?t:0}function et(){if(typeof window>"u")return 0;const e=window.screen.orientation;if(typeof(e==null?void 0:e.angle)=="number")return e.angle;const t=window.orientation;return typeof t=="number"?t:0}function U(e,t,n){switch(N(n)){case 90:return{x:-e,y:t};case 180:return{x:-t,y:-e};case 270:return{x:e,y:-t};default:return{x:t,y:e}}}function K(e,t,n){const i=Math.abs(e);if(i<=t)return 0;const s=Math.max(n,t+1),r=(i-t)/Math.max(s-t,1);return _(r,0,1)*Math.sign(e)}function Z(e,t,n){const i=_(n,0,1);return i===0?t:e+(t-e)*i}function F(e,t,n){return{code:e,message:t,detail:n}}class nt{constructor(t={}){y(this,"listeners",new Set);y(this,"options");y(this,"backend");y(this,"stepState",{x:{lastDirection:0,lastEmitAt:-1/0,sequence:0},y:{lastDirection:0,lastEmitAt:-1/0,sequence:0}});y(this,"snapshot");y(this,"calibration",null);y(this,"unsubscribeBackend",null);y(this,"lastScreenAngle");this.backend=t.backend??Y(),this.options={axisMode:t.axisMode??"both",deadZone:t.deadZone??5,hysteresis:t.hysteresis??2,stepThreshold:t.stepThreshold??12,repeatIntervalMs:t.repeatIntervalMs??160,continuousRange:t.continuousRange??30,smoothing:t.smoothing??.3,autoCalibrateOnStart:t.autoCalibrateOnStart??!0,autoCalibrateOnScreenOrientationChange:t.autoCalibrateOnScreenOrientationChange??!0,initialArmed:t.initialArmed??!1,requireArmedForStep:t.requireArmedForStep??!1,screenOrientationProvider:t.screenOrientationProvider??et,now:t.now??(()=>Date.now())},this.lastScreenAngle=N(this.options.screenOrientationProvider());const n=this.backend.getAvailability(),i=this.deriveInitialStatus(n),s=n.permissionRequired?"unknown":"not-required";this.snapshot={status:i,backend:this.backend.name,permissionState:s,armed:this.options.initialArmed,calibrated:!1,diagnostics:n.blockedDiagnostic?[n.blockedDiagnostic]:n.permissionRequired?[F("permission-required","Tilt permission must be requested from a user gesture.")]:[],calibration:null,rawVector:V(),intentVector:V(),stepEvents:{x:{direction:0,sequence:0,timestamp:null},y:{direction:0,sequence:0,timestamp:null}},lastSample:null,lastConfirmationAt:null,confirmationSequence:0}}deriveInitialStatus(t){return t.supported?t.blockedDiagnostic?"blocked":t.permissionRequired?"needs-permission":"paused":"unsupported"}getSnapshot(){return this.snapshot}subscribe(t){return this.listeners.add(t),()=>{this.listeners.delete(t)}}emitSnapshot(){for(const t of this.listeners)t(this.snapshot)}updateSnapshot(t){this.snapshot={...this.snapshot,...t},this.emitSnapshot()}async start(){if(this.unsubscribeBackend)return this.snapshot;const t=this.backend.getAvailability();return t.supported?t.blockedDiagnostic?(this.updateSnapshot({status:"blocked",diagnostics:[t.blockedDiagnostic]}),this.snapshot):t.permissionRequired&&this.snapshot.permissionState!=="granted"?(this.updateSnapshot({status:"needs-permission",diagnostics:[F("permission-required","Tilt permission must be requested from a user gesture.")]}),this.snapshot):(this.unsubscribeBackend=this.backend.subscribe({onSample:n=>{this.processSample(n)},onError:n=>{this.handleBackendError(n)}}),this.updateSnapshot({status:"active",diagnostics:[]}),this.snapshot):(this.updateSnapshot({status:"unsupported",diagnostics:t.blockedDiagnostic?[t.blockedDiagnostic]:this.snapshot.diagnostics}),this.snapshot)}async requestPermission(){return this.backend.requestPermission?await this.backend.requestPermission()==="granted"?(this.updateSnapshot({permissionState:"granted",diagnostics:[],status:"paused"}),this.start()):(this.updateSnapshot({permissionState:"denied",status:"blocked",diagnostics:[F("permission-denied","Tilt permission was denied by the browser.")]}),this.snapshot):(this.updateSnapshot({permissionState:"not-required"}),this.start())}pause(){return this.unsubscribeBackend&&(this.unsubscribeBackend(),this.unsubscribeBackend=null),this.snapshot.status==="unsupported"||this.snapshot.status==="blocked"?this.snapshot:(this.updateSnapshot({status:"paused"}),this.snapshot)}resume(){return this.start()}calibrate(t=this.snapshot.lastSample){return t?(this.captureCalibration(t),this.updateSnapshot({calibrated:!0,calibration:this.calibration,rawVector:V(),intentVector:V(),stepEvents:{x:{...this.snapshot.stepEvents.x,direction:0},y:{...this.snapshot.stepEvents.y,direction:0}}}),!0):!1}captureCalibration(t){this.calibration={alpha:t.alpha,beta:t.beta,gamma:t.gamma,timestamp:t.timestamp},this.resetStepState()}confirm(){return this.updateSnapshot({confirmationSequence:this.snapshot.confirmationSequence+1,lastConfirmationAt:this.options.now()}),this.snapshot}setArmed(t){return this.updateSnapshot({armed:t}),this.snapshot}destroy(){this.pause(),this.listeners.clear()}resetStepState(){this.stepState.x={lastDirection:0,lastEmitAt:-1/0,sequence:0},this.stepState.y={lastDirection:0,lastEmitAt:-1/0,sequence:0}}handleBackendError(t){this.updateSnapshot({status:"error",diagnostics:[F("backend-error","Tilt input failed while reading the sensor backend.",t.message)]})}processSample(t){const n=N(this.options.screenOrientationProvider());n!==this.lastScreenAngle&&this.options.autoCalibrateOnScreenOrientationChange&&this.calibration&&this.captureCalibration(t),this.lastScreenAngle=n,!this.calibration&&this.options.autoCalibrateOnStart&&this.captureCalibration(t);const s=U(t.beta,t.gamma,n),r=this.calibration?U(this.calibration.beta,this.calibration.gamma,n):{x:0,y:0};let a=s.x-r.x,c=s.y-r.y;this.options.axisMode==="horizontal"?c=0:this.options.axisMode==="vertical"&&(a=0);const u=Z(this.snapshot.rawVector.x,a,this.options.smoothing),p=Z(this.snapshot.rawVector.y,c,this.options.smoothing),x=V(u,p),l=V(K(u,this.options.deadZone,this.options.continuousRange),K(p,this.options.deadZone,this.options.continuousRange)),m={x:this.computeStepEvent("x",u),y:this.computeStepEvent("y",p)};this.updateSnapshot({status:this.snapshot.status==="paused"?"paused":"active",calibrated:this.calibration!==null,calibration:this.calibration,rawVector:x,intentVector:l,stepEvents:m,lastSample:t})}computeStepEvent(t,n){const i=this.stepState[t],s=this.options.now(),r=Math.max(this.options.stepThreshold-this.options.hysteresis,0);let a=0;Math.abs(n)>=this.options.stepThreshold?a=n>0?1:-1:Math.abs(n)<=r&&(i.lastDirection=0),this.options.requireArmedForStep&&!this.snapshot.armed&&(a=0);const c=a!==0&&a!==i.lastDirection,u=a!==0&&s-i.lastEmitAt>=this.options.repeatIntervalMs;return a!==0&&(c||u)?(i.lastDirection=a,i.lastEmitAt=s,i.sequence+=1,{direction:a,sequence:i.sequence,timestamp:s}):{direction:0,sequence:i.sequence,timestamp:this.snapshot.stepEvents[t].timestamp}}}function it(e={}){return new nt(e)}const rt="0.3.0",G="[data-tilt-to-edit]",st=["Brightness","Contrast","Theme","Focus mode","Volume"],at=`
:host {
  all: initial;
}

.tte-shell,
.tte-shell * {
  box-sizing: border-box;
}

.tte-shell {
  font-family: "Avenir Next", "Trebuchet MS", sans-serif;
  color: #f8fafc;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 32%),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.18), transparent 28%),
    linear-gradient(155deg, rgba(7, 17, 31, 0.96), rgba(28, 17, 46, 0.92));
  box-shadow: 0 24px 62px rgba(6, 10, 22, 0.36);
  padding: 1.2rem;
}

.tte-head {
  display: flex;
  gap: 0.9rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.tte-kicker {
  margin: 0 0 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.73rem;
  color: #fbbf24;
}

.tte-title {
  margin: 0;
  font-size: 1.35rem;
  color: #fff7ed;
}

.tte-copy {
  margin: 0.35rem 0 0;
  color: rgba(226, 232, 240, 0.76);
  line-height: 1.5;
}

.tte-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: #fde68a;
}

.tte-status[data-state="blocked"],
.tte-status[data-state="unsupported"],
.tte-status[data-state="error"] {
  color: #fecaca;
}

.tte-status[data-state="needs-permission"],
.tte-status[data-state="paused"] {
  color: #bfdbfe;
}

.tte-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.tte-metric {
  padding: 0.8rem 0.9rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tte-metric-label {
  display: block;
  color: rgba(226, 232, 240, 0.64);
  font-size: 0.78rem;
}

.tte-metric-value {
  display: block;
  margin-top: 0.22rem;
  color: #fff7ed;
  font-weight: 700;
}

.tte-stage {
  margin-top: 1rem;
}

.tte-vector-pad {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 16%, rgba(34, 211, 238, 0.24), transparent 34%),
    linear-gradient(180deg, rgba(12, 33, 64, 0.92), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tte-vector-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.34;
}

.tte-vector-axis {
  position: absolute;
  background: rgba(255, 255, 255, 0.14);
}

.tte-vector-axis-x {
  left: 16px;
  right: 16px;
  top: 50%;
  height: 1px;
}

.tte-vector-axis-y {
  top: 16px;
  bottom: 16px;
  left: 50%;
  width: 1px;
}

.tte-vector-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  margin-top: -11px;
  border-radius: 999px;
  background: #67e8f9;
  box-shadow: 0 0 22px rgba(34, 211, 238, 0.88), 0 0 44px rgba(45, 212, 191, 0.44);
  transition: transform 140ms ease;
}

.tte-vector-label {
  position: absolute;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.46);
}

.tte-vector-label-x {
  right: 18px;
  bottom: 16px;
}

.tte-vector-label-y {
  left: 18px;
  top: 18px;
}

.tte-number-stage {
  padding: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.tte-number-value {
  margin: 0;
  font-size: clamp(2.2rem, 7vw, 3.3rem);
  line-height: 1;
  color: #fff7ed;
}

.tte-number-copy {
  margin: 0.35rem 0 0;
  color: rgba(226, 232, 240, 0.72);
}

.tte-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  margin-top: 1rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.tte-track-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #2dd4bf, #fbbf24);
  box-shadow: 0 0 24px rgba(45, 212, 191, 0.3);
}

.tte-slider {
  width: 100%;
  margin-top: 1rem;
  accent-color: #fbbf24;
}

.tte-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}

.tte-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(248, 250, 252, 0.92);
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
}

.tte-menu-item[data-highlighted="true"] {
  border-color: rgba(251, 191, 36, 0.62);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(255, 255, 255, 0.1));
  transform: translateY(-1px);
}

.tte-menu-item[data-selected="true"] .tte-menu-state {
  color: #fbbf24;
}

.tte-menu-label {
  font-weight: 600;
}

.tte-menu-state {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.44);
}

.tte-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.tte-button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08));
  color: #fff7ed;
  padding: 0.72rem 1rem;
  cursor: pointer;
  box-shadow: 0 18px 38px rgba(8, 15, 28, 0.24);
}

.tte-button[data-variant="primary"] {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.38), rgba(45, 212, 191, 0.22));
}

.tte-button[hidden] {
  display: none;
}

.tte-diagnostics {
  margin: 1rem 0 0;
  padding-left: 1.2rem;
  color: #fed7aa;
}

@media (max-width: 720px) {
  .tte-shell {
    padding: 1rem;
  }

  .tte-head {
    flex-direction: column;
  }
}
`,j=Y(),W=new WeakMap,$=new Set;function L(e,t,n){return Math.min(n,Math.max(t,e))}function ot(e,t){return t===0?0:L(e,0,t-1)}function ct(e){return e==="sensor"||e==="stepper"||e==="slider"||e==="menu"?e:null}function dt(e){const t=e==null?void 0:e.split("|").map(n=>n.trim()).filter(Boolean);return t&&t.length>0?t:st}function A(e,t){if(!e)return t;const n=Number(e);return Number.isFinite(n)?n:t}function R(e){switch(e){case"needs-permission":return"needs permission";default:return e}}function o(e,t,n){const i=document.createElement(e);return t&&(i.className=t),n!==void 0&&(i.textContent=n),i}function f(e){const t=o("div","tte-metric"),n=o("span","tte-metric-label",e),i=o("strong","tte-metric-value");return t.append(n,i),{root:t,value:i}}function T(e,t="default"){const n=o("button","tte-button",e);return n.type="button",t==="primary"&&(n.dataset.variant="primary"),n}function ut(e,t){e.replaceChildren();const n=document.createElement("style");n.textContent=at;const i=o("article","tte-shell"),s=o("header","tte-head"),r=o("div"),a=o("p","tte-kicker",t.kind==="sensor"?"Script Tag Sensor":t.kind==="menu"?"Hybrid Menu":t.kind==="slider"?"Continuous Control":"Discrete Control"),c=o("h2","tte-title",t.title),u=o("p","tte-copy",t.description),p=o("strong","tte-status","paused");r.append(a,c,u),s.append(r,p);const x=o("div","tte-metrics"),l=o("div","tte-stage"),m=o("div","tte-actions"),S=o("div","tte-actions"),v=o("ul","tte-diagnostics"),h=T("Enable tilt","primary"),E=T("Calibrate"),q=T("Pause");return m.append(h,E,q),i.append(s,x,l,m,S,v),e.append(n,i),{shell:i,status:p,stage:l,diagnostics:v,primaryActions:m,secondaryActions:S,requestPermissionButton:h,calibrateButton:E,pauseButton:q,metrics:x}}function lt(e){if(typeof e!="string")return e;const t=document.querySelector(e);if(!t)throw new Error(`Unable to find tilt embed target: ${e}`);return t}function pt(e,t={}){const n=ct(e.dataset.tiltToEdit??e.dataset.tiltType),i=t.kind??n??"sensor",s={sensor:{title:"Tilt Sensor",description:"This widget exposes live tilt intent so the host page can react with any motion-driven experience."},stepper:{title:"Tilt Stepper",description:"Lean left and right to nudge a draft value, then confirm explicitly."},slider:{title:"Tilt Slider",description:"Use tilt as a soft analog input, then confirm when the preview lands where you want it."},menu:{title:"Tilt Menu",description:"Tilt up and down to browse. Lean right to commit. Lean left to restore the current selection."}}[i],r=t.items??dt(e.dataset.tiltItems),a=t.min??A(e.dataset.tiltMin,0),c=t.max??A(e.dataset.tiltMax,100),u=t.value??A(e.dataset.tiltValue,42),p=ot(t.selectedIndex??A(e.dataset.tiltSelectedIndex,0),r.length);return{kind:i,title:t.title??e.dataset.tiltTitle??s.title,description:t.description??e.dataset.tiltDescription??s.description,items:r,selectedIndex:p,min:a,max:c,value:L(u,a,c),step:Math.max(t.step??A(e.dataset.tiltStep,1),1),sensitivity:Math.max(t.sensitivity??A(e.dataset.tiltSensitivity,c-a),1),stepThreshold:Math.max(t.stepThreshold??A(e.dataset.tiltStepThreshold,i==="menu"?8:6),1),backend:t.backend,autoStart:t.autoStart??!0,onState:t.onState,onChange:t.onChange,onCommit:t.onCommit}}function mt(e){switch(e.kind){case"slider":return{backend:e.backend??j,axisMode:"horizontal",smoothing:.75};case"stepper":return{backend:e.backend??j,axisMode:"horizontal",smoothing:.75,stepThreshold:e.stepThreshold};case"menu":return{backend:e.backend??j,axisMode:"both",smoothing:.72,stepThreshold:e.stepThreshold};default:return{backend:e.backend??j,axisMode:"both",deadZone:2,smoothing:.72,continuousRange:20}}}function D(e,t,n,i){i==null||i(n),e.dispatchEvent(new CustomEvent(`tilt-to-edit:${t}`,{detail:n,bubbles:!0,composed:!0}))}function H(e,t){e.status.textContent=R(t.status),e.status.dataset.state=t.status,e.requestPermissionButton.hidden=t.status!=="needs-permission",e.pauseButton.textContent=t.status==="active"?"Pause":"Resume",e.pauseButton.disabled=t.status==="blocked"||t.status==="unsupported"||t.status==="error",e.diagnostics.replaceChildren();for(const n of t.diagnostics){const i=o("li",void 0,n.message);e.diagnostics.append(i)}}function ht(e,t,n,i){const s=f("Status"),r=f("Intent X"),a=f("Intent Y"),c=f("Confirmations");n.metrics.append(s.root,r.root,a.root,c.root);const u=o("div","tte-vector-pad"),p=o("div","tte-vector-grid"),x=o("div","tte-vector-axis tte-vector-axis-x"),l=o("div","tte-vector-axis tte-vector-axis-y"),m=o("div","tte-vector-orb"),S=o("span","tte-vector-label tte-vector-label-x","X axis"),v=o("span","tte-vector-label tte-vector-label-y","Y axis");return u.append(p,x,l,m,S,v),n.stage.append(u),{update(h){H(n,h),s.value.textContent=R(h.status),r.value.textContent=h.intentVector.x.toFixed(2),a.value.textContent=h.intentVector.y.toFixed(2),c.value.textContent=String(h.confirmationSequence),m.style.transform=`translate(${h.intentVector.x*68}px, ${h.intentVector.y*-56}px)`},buildDetail(h){return{kind:"sensor",snapshot:h}},confirm(){return t.confirm()},destroy(){}}}function bt(e,t,n,i){let s=i.value,r=i.value,a=t.getSnapshot().stepEvents.x.sequence;const c=f("Status"),u=f("Committed"),p=f("Draft"),x=f("Intent X");n.metrics.append(c.root,u.root,p.root,x.root);const l=o("div","tte-number-stage"),m=o("p","tte-number-value"),S=o("p","tte-number-copy","Discrete tilt steps update the draft. Commit when it feels right."),v=o("div","tte-track"),h=o("div","tte-track-fill");v.append(h),l.append(m,S,v),n.stage.append(l);const E=T("Reset draft"),q=T("Confirm","primary");n.secondaryActions.append(E,q);const O=b=>{H(n,b),c.value.textContent=R(b.status),u.value.textContent=s.toFixed(0),p.value.textContent=r.toFixed(0),x.value.textContent=b.intentVector.x.toFixed(2),m.textContent=r.toFixed(0),h.style.width=`${(r-i.min)/Math.max(i.max-i.min,1)*100}%`},g=b=>{D(e,"change",{kind:"stepper",snapshot:b,committedValue:s,draftValue:r},i.onChange)},M=b=>{s=r;const B=t.confirm();return O(B),D(e,"commit",{kind:"stepper",snapshot:B,committedValue:s,draftValue:r},i.onCommit),B};return E.addEventListener("click",()=>{r=s,O(t.getSnapshot()),g(t.getSnapshot())}),q.addEventListener("click",()=>{M()}),{update(b){b.stepEvents.x.sequence!==a&&b.stepEvents.x.direction!==0?(a=b.stepEvents.x.sequence,r=L(r+b.stepEvents.x.direction*i.step,i.min,i.max),g(b)):a=b.stepEvents.x.sequence,O(b)},buildDetail(b){return{kind:"stepper",snapshot:b,committedValue:s,draftValue:r}},confirm(){return M()},destroy(){}}}function gt(e,t,n,i){let s=i.value,r=i.value,a=Number.NaN;const c=f("Status"),u=f("Committed"),p=f("Draft"),x=f("Intent X");n.metrics.append(c.root,u.root,p.root,x.root);const l=o("div","tte-number-stage"),m=o("p","tte-number-value"),S=o("p","tte-number-copy","Continuous tilt previews the value before you commit it."),v=o("input","tte-slider");v.type="range",v.readOnly=!0,v.min=String(i.min),v.max=String(i.max),l.append(m,S,v),n.stage.append(l);const h=T("Confirm","primary");n.secondaryActions.append(h);const E=g=>{H(n,g),c.value.textContent=R(g.status),u.value.textContent=s.toFixed(2),p.value.textContent=r.toFixed(2),x.value.textContent=g.intentVector.x.toFixed(2),m.textContent=r.toFixed(2),v.value=String(r)},q=g=>{D(e,"change",{kind:"slider",snapshot:g,committedValue:s,draftValue:r},i.onChange)},O=g=>{s=r;const M=t.confirm();return E(M),D(e,"commit",{kind:"slider",snapshot:M,committedValue:s,draftValue:r},i.onCommit),M};return h.addEventListener("click",()=>{O()}),{update(g){r=L(s+g.intentVector.x*i.sensitivity,i.min,i.max),Math.abs(r-a)>=.01&&(a=r,q(g)),E(g)},buildDetail(g){return{kind:"slider",snapshot:g,committedValue:s,draftValue:r}},confirm(){return O()},destroy(){}}}function ft(e,t,n,i){let s=i.selectedIndex,r=i.selectedIndex,a="idle",c=t.getSnapshot().stepEvents.y.sequence,u=t.getSnapshot().stepEvents.x.sequence;const p=f("Status"),x=f("Selected"),l=f("Highlighted"),m=f("Action"),S=f("Intent");n.metrics.append(p.root,x.root,l.root,m.root,S.root);const v=o("ol","tte-menu-list"),h=i.items.map(d=>{const k=o("li","tte-menu-item"),P=o("span","tte-menu-label",d),z=o("span","tte-menu-state");return k.append(P,z),v.append(k),{row:k,state:z,item:d}});n.stage.append(v);const E=T("Return"),q=T("Commit","primary");n.secondaryActions.append(E,q);const O=()=>{for(const[d,k]of h.entries()){const P=d===r,z=d===s;k.row.dataset.highlighted=String(P),k.row.dataset.selected=String(z),k.state.textContent=z?"Live":P?"Focus":""}},g=d=>{H(n,d),p.value.textContent=R(d.status),x.value.textContent=i.items[s]??"n/a",l.value.textContent=i.items[r]??"n/a",m.value.textContent=a==="idle"?"idle":a==="browse"?"browse":a,S.value.textContent=`${d.intentVector.x.toFixed(2)} / ${d.intentVector.y.toFixed(2)}`,O()},M=d=>{D(e,"change",{kind:"menu",snapshot:d,action:a,selectedIndex:s,highlightedIndex:r,selectedItem:i.items[s]??"",highlightedItem:i.items[r]??""},i.onChange)},b=d=>{s=r,a="committed";const k=t.confirm();g(k);const P={kind:"menu",snapshot:k,action:a,selectedIndex:s,highlightedIndex:r,selectedItem:i.items[s]??"",highlightedItem:i.items[r]??""};return D(e,"commit",P,i.onCommit),k},B=()=>{r=s,a="reverted";const d=t.getSnapshot();return g(d),M(d),d};return E.addEventListener("click",()=>{B()}),q.addEventListener("click",()=>{b()}),{update(d){d.stepEvents.y.sequence!==c&&d.stepEvents.y.direction!==0?(c=d.stepEvents.y.sequence,r=L(r+d.stepEvents.y.direction,0,i.items.length-1),a="browse",M(d)):c=d.stepEvents.y.sequence,d.stepEvents.x.sequence!==u&&d.stepEvents.x.direction!==0?(u=d.stepEvents.x.sequence,Math.abs(d.intentVector.x)>Math.abs(d.intentVector.y)+.08&&(d.stepEvents.x.direction>0?b():B())):u=d.stepEvents.x.sequence,g(d)},buildDetail(d){return{kind:"menu",snapshot:d,action:a,selectedIndex:s,highlightedIndex:r,selectedItem:i.items[s]??"",highlightedItem:i.items[r]??""}},confirm(){return b()},destroy(){}}}function xt(e,t,n,i){switch(i.kind){case"stepper":return bt(e,t,n,i);case"slider":return gt(e,t,n,i);case"menu":return ft(e,t,n,i);default:return ht(e,t,n)}}function J(e,t={}){const n=lt(e),i=W.get(n);if(i)return i;const s=pt(n,t),r=n.shadowRoot??n.attachShadow({mode:"open"}),a=ut(r,s),c=it(mt(s)),u=xt(n,c,a,s),p=m=>{const S=u.buildDetail(m);D(n,"state",S,s.onState)},x=c.subscribe(m=>{u.update(m),p(m)}),l={element:n,kind:s.kind,requestPermission:()=>c.requestPermission(),calibrate:()=>c.calibrate(),pause:()=>c.pause(),resume:()=>c.resume(),confirm:()=>u.confirm(),destroy:()=>{x(),u.destroy(),c.destroy(),r.replaceChildren(),W.delete(n),$.delete(l)},getSnapshot:()=>c.getSnapshot()};return a.requestPermissionButton.addEventListener("click",()=>{l.requestPermission()}),a.calibrateButton.addEventListener("click",()=>{l.calibrate()}),a.pauseButton.addEventListener("click",()=>{if(c.getSnapshot().status==="active"){l.pause();return}l.resume()}),W.set(n,l),$.add(l),u.update(c.getSnapshot()),p(c.getSnapshot()),D(n,"ready",u.buildDetail(c.getSnapshot())),s.autoStart&&c.start(),l}function vt(e){const t=new Set;if(e instanceof HTMLElement&&e.matches(G)&&t.add(e),"querySelectorAll"in e)for(const n of e.querySelectorAll(G))t.add(n);return Array.from(t)}function Q(e=document,t={}){return vt(e).map(n=>J(n,{backend:t.backend,autoStart:t.autoStart}))}function yt(){return Array.from($)}const X={version:rt,mount:J,scan:Q,getInstances:yt};if(typeof window<"u"){window.TiltToEdit=X;const e=()=>{Q()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e,{once:!0}):queueMicrotask(e)}return C.TiltToEdit=X,C.default=X,Object.defineProperties(C,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}}),C})({});
