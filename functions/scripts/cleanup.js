const { ArtifactRegistryClient } = require('@google-cloud/artifact-registry');
const serviceAccount = require('../../serviceAccountKey.json');

// Define project details
const PROJECT_ID = 'quantumleap-emr-dev';
const LOCATION = 'us-central1';
const REPO_NAMES = ['gcf', 'gcf-artifacts', 'cloud-functions']; // Common repository names

async function deleteAllImages() {
    const client = new ArtifactRegistryClient({
        credentials: {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key
        },
        projectId: PROJECT_ID
    });

    let foundAnyRepo = false;

    // Try each possible repository name
    for (const repoName of REPO_NAMES) {
        const parent = `projects/${PROJECT_ID}/locations/${LOCATION}/repositories/${repoName}`;

        try {
            console.log(`\nChecking repository: ${repoName}`);
            
            // List all images
            const [packages] = await client.listPackages({ parent });

            if (!packages.length) {
                console.log(`No images found in repository: ${repoName}`);
                continue;
            }

            foundAnyRepo = true;
            console.log(`Found ${packages.length} packages in repository: ${repoName}`);

            // Delete each image package
            for (const pkg of packages) {
                console.log(`Deleting: ${pkg.name}`);
                await client.deletePackage({ name: pkg.name });
            }

            console.log(`Successfully cleaned up repository: ${repoName}`);
        } catch (error) {
            if (error.code === 5) {
                console.log(`Repository ${repoName} not found. Trying next...`);
            } else if (error.code === 7) {
                console.log('\nPermission denied. Please run the following command:');
                console.log(`gcloud projects add-iam-policy-binding ${PROJECT_ID} \\`);
                console.log(`  --member="serviceAccount:${serviceAccount.client_email}" \\`);
                console.log('  --role="roles/artifactregistry.admin"');
                return;
            } else {
                console.error(`Error with repository ${repoName}:`, error);
            }
        }
    }

    if (!foundAnyRepo) {
        console.log('\nNo active repositories found. This is normal for first deployment or if cleanup was successful.');
    }
}

deleteAllImages().catch(console.error);
