<template>
    <div v-if="block.hash">

        <h3>Block #{{ this.$route.params.id }}</h3>
        <table>
            <tbody>
                <tr>
                    <td>Hash</td>
                    <td>{{ block.hash }}</td>
                </tr>
                <tr>
                    <td>Previous hash</td>
                    <td>{{ block.previousHash}}</td>
                </tr>
                <tr>
                    <td>Voter's Address</td>
                    <td>{{ block.data.voterAddress }}</td>
                </tr>
                <tr>
                    <td>Candidate Voted</td>
                    <td>{{ this.$route.params.cand }}</td>
                </tr>
                <tr>
                    <td>Candidate Address</td>
                    <td>{{ block.data.candidateAddress }}</td>
                </tr>
                <tr>
                    <td>Timestamp</td>
                    <td>{{ getTimeString(block.timestamp) }}</td>
                </tr>

            </tbody>
        </table>
    </div>
</template>

<script>export default {
        name: 'Block',
        data() {
            return {
                block: {}
            }
        },
        created() {
            this.getBlock();
            
        },
        methods: {
            getBlock: function () {
                this.block = this.$route.params.data;
                console.log(0);
                //this.$http.get('/api/block/' + hash)
                //    .then(resp => {
                //        this.block = resp.data;
                //    })
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
            trimAddress: function (address) {
                return address.substr(0, 24) + '...';
            }
        }
    }</script>

<style scoped>
    .transaction {
        padding: 1em;
        margin-bottom: 1em;
        background-color: gainsboro;
    }
</style>
