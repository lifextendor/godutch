/**
 * Created by vein on 2016/9/5.
 */
var GROUP_TYPE = {
    NORMAL:'normal', //�Է����ʱ�
    BILL:'bill', //�����ʱ�
    FUND:'fund', //�����
    ASSOCIATION:'association' //Э������
};
module.exports = {
    verifyGroup:function(group){
        var result = true;
        if(group){
            result = result && (group.gname !== '');
            result = result && (group.description !== undefined);
        } else{
            result = false;
        }
        return result;
    },
    getGroupType:function(type){
        if(type !== GROUP_TYPE.BILL && type !== GROUP_TYPE.FUND && type !== GROUP_TYPE.ASSOCIATION){
            return GROUP_TYPE.NORMAL;
        }
        return type;
    },
    getGuid:function(){
        return 'xxxxx1xxxx0xxxx7xxyxxxx5xxxxx2xxxx0xx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};