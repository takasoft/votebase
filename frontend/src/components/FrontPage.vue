<template>
    <div>
        <br />
        <h4>Voter Address: </h4>
        <h5>{{ this.myAddress }}</h5>
        <br />
        <h3>Please select one candidate and vote: </h3>
        <select v-model="selected">
            <option v-for="candidate in this.candidates" v-bind:value="candidate.address">
                {{ candidate.name }}
            </option>
        </select>
        <button v-on:click="vote" class="button-primary" id="btn1">Vote</button>
        <p :style="{visibility: 'hidden'}" id="p">You have voted for {{ this.myCandidate }}. </p>
        <br /><br /><br />
        <h3>Voting Result</h3>
        <table>
            <thead>
                <tr>
                    <th>Candidate</th>
                    <th># Votes</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="r in results">
                    <td>{{ r.name }}</td>
                    <td>{{ r.votes }}</td>
                </tr>
            </tbody>
        </table>
        <br /><br />
        <h3>Voting History</h3>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>hash</th>
                    <th>Timestamp</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="block in sortBlocks(blocks)">
                    <td>{{ block.index }}</td>
                    <td><router-link :to="{ name: 'Block', params: { id: block.index, data: block, cand: findCandName(block) }}">{{ block.hash }}</router-link></td>
                    <td>{{ getTimeString(block.timestamp) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>export default {
        name: 'FrontPage',
        data() {
            return {
                selected: 0,
                blocks: [],
                timer: '',
                candidates: [],
                myAddress: '',
                results: [],
                myCandidate: ''
            }
        },
        created() {
            this.getCandidatesList();
            this.getAddress();
            this.timer = setInterval(this.getBlocks, 3000)
        },
        methods: {
            getBlocks: function () {
                this.$http.get('/api/blocks')
                    .then((resp) => {
                        this.blocks = resp.data;
                        //console.log(this.blocks[0]);
                        for (var k = 0; k < this.candidates.length; ++k) {
                            this.results[k].votes = 0;
                        }
                        for (var i = 1; i < this.blocks.length; ++i) {
                            for (var j = 0; j < this.candidates.length; ++j) {
                                if (this.blocks[i].data.candidateAddress == this.candidates[j].address) {
                                    this.results[j].votes += 1;
                                    break;
                                }
                            }
                        }
                        //console.log(this.results);
                    })
            },
            findCandName: function (block) {
                if (block.data) {
                    for (var k = 0; k < this.candidates.length; ++k) {
                        if (block.data.candidateAddress == this.candidates[k].address) {
                            return this.candidates[k].name;
                        }
                    }
                }
                
            },
            getAddress: function () {
                this.$http.get('/api/address')
                    .then((resp) => {
                        this.myAddress = resp.data.address;
                        this.getBlocks();
                    })
            },
            sortBlocks: function (blocks) {
                return _(blocks)
                    .sortBy('index')
                    .reverse()
                    .value();
            },
            getTimeString: function (timestamp) {
                var date = new Date(timestamp * 1000);
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDate();
                var hour = date.getHours();
                var minute = "0" + date.getMinutes();
                var second = "0" + date.getSeconds();
                var formattedTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute.substr(-2) + ':' + second.substr(-2);
                return formattedTime;
            },
            cancelAutoUpdate() { clearInterval(this.timer) },
            getCandidatesList: function () {
                this.$http.get('http://10.104.150.84:8888/candidates')
                    .then((resp) => {
                        this.candidates = resp.data.candidates;
                        for (var j = 0; j < this.candidates.length; ++j) {
                            this.results.push({ name: this.candidates[j].name, votes: 0 });
                            console.log({ name: this.candidates[j].name, votes: 0 });
                        }
                        this.getBlocks();
                        //console.log(resp.data);
                    })
                //this.candidates = [{ id: 0, name: "Bennet" }, { id: 1, name: "Biden" }, { id: 2, name: "Bloomberg" }, { id: 3, name: "Buttigieg" }, { id: 4, name: "Gabbard" }, { id: 5, name: "Klobuchar" }, { id: 6, name: "Patrick" }, { id: 7, name: "Sanders" }, { id: 8, name: "Steyer" }, { id: 9, name: "Warren" }, { id: 10, name: "Yang" }, { id: 11, name: "Trump" }, { id: 12, name: "Weld" }];
            },
            vote: function () {
                this.$http.post('/api/mineBlock', { 'candidateAddress': this.selected.toString() }).then(console.log(this.selected))
                document.getElementById("btn1").style.visibility = 'hidden';
                for (var k = 0; k < this.candidates.length; ++k) {
                    if (this.selected == this.candidates[k].address) {
                        this.myCandidate = this.candidates[k].name;
                    }
                }
                document.getElementById("p").style.visibility = "visible";
            }
        },
        beforeDestroy() {
            clearInterval(this.timer)
        }
    }</script>


<style>
    div {
        word-wrap: break-word;
    }

</style>
