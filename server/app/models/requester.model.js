module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            requesterName: String,
            requesterEmail: String,
            requesterAffilation: String,
            googleScholar: String,
            dblp: String,
            justification: String,
            algorithmName: String,
            authorName: String,
            paperReference: String,
            githubLink: String,
            comments: String,
            isApproved: Boolean
        }
    );


    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });


    const Requester = mongoose.model("requester", schema);
    return Requester;
};