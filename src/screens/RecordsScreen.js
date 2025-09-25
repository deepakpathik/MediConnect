import React, { useContext, useState } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { Appbar, Text, Searchbar, Card, ActivityIndicator, Chip } from "react-native-paper";
import { ThemeContext } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

export default function RecordsScreen() {
  const { theme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchDiseases = async (query) => {
    if (!query || query.length < 2) {
      setDiseases([]);
      return;
    }

    try {
      setSearching(true);
      const response = await axios.get(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${query}&maxList=10`
      );
      
      if (response.data && response.data[3]) {
        const results = response.data[3].map((item, index) => ({
          id: index,
          name: item[0],
          synonyms: item[1] || [],
        }));
        setDiseases(results);
      }
    } catch (error) {
      console.error("Error searching diseases:", error);
    } finally {
      setSearching(false);
    }
  };

  const fetchDiseaseDetails = async (diseaseName) => {
    try {
      setLoading(true);
      console.log('Fetching disease details for:', diseaseName);
      
      // Use Wikipedia API for reliable disease information
      const wikiResponse = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(diseaseName)}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MediConnect/1.0',
          }
        }
      );

      console.log('Wikipedia API response received');
      const data = wikiResponse.data;
      
      setSelectedDisease({
        name: diseaseName,
        title: data.title || diseaseName,
        summary: data.extract || "No description available for this condition.",
        link: data.content_urls?.desktop?.page || null,
      });
    } catch (error) {
      console.error('Error fetching disease details:', error.message);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      setSelectedDisease({
        name: diseaseName,
        title: diseaseName,
        summary: "Unable to load disease information. Please check your internet connection and try again.",
        link: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(null);
    fetchDiseaseDetails(disease.name);
    setDiseases([]);
    setSearchQuery(disease.name);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchDiseases(query);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Disease Search & Info" titleStyle={{ color: "#fff" }} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search diseases, conditions..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          loading={searching}
        />
      </View>

      <ScrollView style={styles.content}>
        {diseases.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text variant="titleSmall" style={[styles.resultsTitle, { color: theme.colors.text }]}>
              Search Results
            </Text>
            {diseases.map((disease) => (
              <Card
                key={disease.id}
                style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleDiseaseSelect(disease)}
              >
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: theme.colors.text }}>
                    {disease.name}
                  </Text>
                  {disease.synonyms.length > 0 && (
                    <View style={styles.synonymsContainer}>
                      {disease.synonyms.slice(0, 3).map((syn, idx) => (
                        <Chip key={idx} style={styles.chip} compact>
                          {syn}
                        </Chip>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, marginTop: 16 }}>
              Loading disease information...
            </Text>
          </View>
        )}

        {selectedDisease && !loading && (
          <View style={styles.detailsContainer}>
            <Card style={[styles.detailCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.detailHeader}>
                  <MaterialCommunityIcons
                    name="medical-bag"
                    size={40}
                    color={theme.colors.primary}
                  />
                  <Text variant="headlineSmall" style={[styles.detailTitle, { color: theme.colors.text }]}>
                    {selectedDisease.title}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                    Description
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.text, lineHeight: 22 }}>
                    {selectedDisease.summary}
                  </Text>
                </View>

                {selectedDisease.link && (
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                      Learn More
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.text, opacity: 0.7 }}>
                      Visit MedlinePlus for detailed information
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {!loading && !selectedDisease && diseases.length === 0 && searchQuery.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={80}
              color={theme.colors.primary}
            />
            <Text variant="titleLarge" style={[styles.emptyText, { color: theme.colors.text }]}>
              Search for Diseases
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.text, opacity: 0.6, textAlign: "center" }}>
              Search for any disease or medical condition to get detailed information
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  resultCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.1)',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  synonymsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    marginRight: 4,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  detailsContainer: {
    padding: 16,
  },
  detailCard: {
    borderRadius: 20,
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 238, 0.15)',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailTitle: {
    marginLeft: 12,
    flex: 1,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
});
