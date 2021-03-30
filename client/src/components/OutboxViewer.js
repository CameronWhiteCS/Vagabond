import Feed from 'components/Feed.js';

const OutboxViewer = () => {

    return (
        <>
            <h1>Outbox</h1>
            <Feed type="outbox"/>
        </>
    )

}

export default OutboxViewer;